
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';
import { useAuth } from '../../auth/AuthContext';

// Interface for our class data
interface ClassSlot {
  id: string; // The time, e.g., "09:00"
  className: string;
  maxCapacity: number;
  registeredUsers: string[];
}

interface SchedulerProps {
  onBack?: () => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ onBack }) => {
  const [classSlots, setClassSlots] = useState<ClassSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Generate time slots from 9:00 to 21:00
  const timeSlots = Array.from({ length: 13 }, (_, i) =>
    `${(9 + i).toString().padStart(2, '0')}:00`
  );

  // Create an array of the next 7 days for the date picker
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().slice(0, 10);
  });

  // --- Fetch Schedule ---
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedDate) return;
      setLoading(true);
      const slotsCollectionRef = collection(
        db,
        `schedules/${selectedDate}/slots`
      );
      try {
        const querySnapshot = await getDocs(slotsCollectionRef);
        if (querySnapshot.empty) {
          console.log(`No schedule found for ${selectedDate}.`);
          setClassSlots([]);
        } else {
          const slotsList = querySnapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as ClassSlot)
          );
          setClassSlots(slotsList);
        }
      } catch (error) {
        console.error(`Error fetching schedule for ${selectedDate}: `, error);
        setClassSlots([]);
      }
      setLoading(false);
    };

    fetchSchedule();
  }, [selectedDate]);

  // --- Create Default Schedule ---
  const handleCreateSchedule = async () => {
    setLoading(true);
    const batch = writeBatch(db);
    const defaultSlots: ClassSlot[] = [];

    for (let i = 9; i <= 17; i++) {
      const time = `${i.toString().padStart(2, '0')}:00`;
      const slotData = {
        className: 'Open Gym',
        maxCapacity: 10,
        registeredUsers: [],
      };
      const slotDocRef = doc(db, `schedules/${selectedDate}/slots`, time);
      batch.set(slotDocRef, slotData);
      defaultSlots.push({ id: time, ...slotData });
    }

    try {
      await batch.commit();
      setClassSlots(defaultSlots);
    } catch (error) {
      console.error('Error creating default schedule: ', error);
    }
    setLoading(false);
  };

  // --- Booking Logic ---
  const handleBooking = async (slotId: string, isBooked: boolean) => {
    if (!currentUser) {
      alert('You must be logged in to book a class.');
      return;
    }
    const slotDocRef = doc(db, `schedules/${selectedDate}/slots`, slotId);
    try {
      if (isBooked) {
        // Unbook
        await updateDoc(slotDocRef, {
          registeredUsers: arrayRemove(currentUser.uid),
        });
      } else {
        // Book
        await updateDoc(slotDocRef, {
          registeredUsers: arrayUnion(currentUser.uid),
        });
      }
      // Refresh local state to show booking changes
      setClassSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                registeredUsers: isBooked
                  ? slot.registeredUsers.filter((uid) => uid !== currentUser.uid)
                  : [...slot.registeredUsers, currentUser.uid],
              }
            : slot
        )
      );
    } catch (error) {
      console.error('Error updating booking: ', error);
    }
  };

  const getClassForSlot = (time: string): Partial<ClassSlot> => {
    return classSlots.find((slot) => slot.id === time) || {};
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
        >
          Back to Home
        </button>
      )}
      <h1 className="text-3xl font-bold text-center mb-4">Class Schedule</h1>

      <div className="flex justify-center mb-6">
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          {nextSevenDays.map((date) => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center">Loading schedule...</p>
      ) : classSlots.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">No schedule has been created for this day.</p>
          <button
            onClick={handleCreateSchedule}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Default Schedule
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 border-b text-left">Time</th>
                <th className="py-3 px-4 border-b text-left">Class</th>
                <th className="py-3 px-4 border-b text-center">
                  Availability
                </th>
                <th className="py-3 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => {
                const {
                  className = 'No Class',
                  registeredUsers = [],
                  maxCapacity = 0,
                } = getClassForSlot(time);
                const isFull = registeredUsers.length >= maxCapacity;
                const isBooked = currentUser
                  ? registeredUsers.includes(currentUser.uid)
                  : false;
                const canBook = className !== 'No Class';

                return (
                  <tr
                    key={time}
                    className={`hover:bg-gray-100 ${isBooked ? 'bg-blue-100' : ''}`}
                  >
                    <td className="py-3 px-4 border-b font-medium">
                      {time} -{' '}
                      {`${(parseInt(time.split(':')[0]) + 1)
                        .toString()
                        .padStart(2, '0')}:00`}
                    </td>
                    <td className="py-3 px-4 border-b">{className}</td>
                    <td className="py-3 px-4 border-b text-center">
                      {maxCapacity > 0
                        ? `${registeredUsers.length} / ${maxCapacity}`
                        : '--'}
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <button
                        className={`font-bold py-2 px-4 rounded transition duration-300 ${
                          !canBook || !currentUser
                            ? 'bg-gray-400 cursor-not-allowed'
                            : isBooked
                            ? 'bg-red-500 hover:bg-red-700 text-white'
                            : isFull
                            ? 'bg-gray-500 text-white cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-700 text-white'
                        }`}
                        disabled={!canBook || !currentUser || (isFull && !isBooked)}
                        onClick={() => handleBooking(time, isBooked)}
                      >
                        {isBooked ? 'Unbook' : 'Book'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Scheduler;

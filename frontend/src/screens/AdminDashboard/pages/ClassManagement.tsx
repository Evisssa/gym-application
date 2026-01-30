import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
} from 'firebase/firestore';

// Interface for our class data
interface ClassSlot {
  id: string;
  className: string;
  maxCapacity: number;
  registeredUsers: string[];
}

const ClassManagement: React.FC = () => {
  const [classSlots, setClassSlots] = useState<ClassSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [newMaxCapacity, setNewMaxCapacity] = useState(10);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editMaxCapacity, setEditMaxCapacity] = useState(10);

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

  // Fetch Schedule
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

  // Add new class
  const handleAddClass = async (time: string) => {
    if (!newClassName.trim()) return;
    const slotDocRef = doc(db, `schedules/${selectedDate}/slots`, time);
    try {
      await addDoc(collection(db, `schedules/${selectedDate}/slots`), {
        className: newClassName,
        maxCapacity: newMaxCapacity,
        registeredUsers: [],
      });
      setNewClassName('');
      setNewMaxCapacity(10);
      // Refresh the list
      const querySnapshot = await getDocs(collection(db, `schedules/${selectedDate}/slots`));
      const slotsList = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ClassSlot)
      );
      setClassSlots(slotsList);
    } catch (error) {
      console.error('Error adding class: ', error);
    }
  };

  // Remove class
  const handleRemoveClass = async (slotId: string) => {
    const slotDocRef = doc(db, `schedules/${selectedDate}/slots`, slotId);
    try {
      await deleteDoc(slotDocRef);
      setClassSlots((prevSlots) => prevSlots.filter((slot) => slot.id !== slotId));
    } catch (error) {
      console.error('Error removing class: ', error);
    }
  };

  // Start editing
  const handleEditClass = (slot: ClassSlot) => {
    setEditingSlot(slot.id);
    setEditClassName(slot.className);
    setEditMaxCapacity(slot.maxCapacity);
  };

  // Save edit
  const handleSaveEdit = async (slotId: string) => {
    const slotDocRef = doc(db, `schedules/${selectedDate}/slots`, slotId);
    try {
      await updateDoc(slotDocRef, {
        className: editClassName,
        maxCapacity: editMaxCapacity,
      });
      setClassSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot.id === slotId
            ? { ...slot, className: editClassName, maxCapacity: editMaxCapacity }
            : slot
        )
      );
      setEditingSlot(null);
    } catch (error) {
      console.error('Error updating class: ', error);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingSlot(null);
    setEditClassName('');
    setEditMaxCapacity(10);
  };

  const getClassForSlot = (time: string): Partial<ClassSlot> => {
    return classSlots.find((slot) => slot.id === time) || {};
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Class Management</h1>

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
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 border-b text-left">Time</th>
                <th className="py-3 px-4 border-b text-left">Class</th>
                <th className="py-3 px-4 border-b text-center">Capacity</th>
                <th className="py-3 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => {
                const slot = getClassForSlot(time);
                const isEditing = editingSlot === time;

                return (
                  <tr key={time} className="hover:bg-gray-100">
                    <td className="py-3 px-4 border-b font-medium">
                      {time} -{' '}
                      {`${(parseInt(time.split(':')[0]) + 1)
                        .toString()
                        .padStart(2, '0')}:00`}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editClassName}
                          onChange={(e) => setEditClassName(e.target.value)}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        slot.className || 'No Class'
                      )}
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editMaxCapacity}
                          onChange={(e) => setEditMaxCapacity(Number(e.target.value))}
                          className="w-20 p-1 border rounded text-center"
                        />
                      ) : (
                        slot.maxCapacity || '--'
                      )}
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      {slot.className ? (
                        isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(time)}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClass(slot as ClassSlot)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveClass(time)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                            >
                              Remove
                            </button>
                          </>
                        )
                      ) : (
                        <div className="flex items-center">
                          <input
                            type="text"
                            placeholder="Class Name"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            className="p-1 border rounded mr-2 flex-1"
                          />
                          <input
                            type="number"
                            placeholder="Capacity"
                            value={newMaxCapacity}
                            onChange={(e) => setNewMaxCapacity(Number(e.target.value))}
                            className="p-1 border rounded mr-2 w-20"
                          />
                          <button
                            onClick={() => handleAddClass(time)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                          >
                            Add
                          </button>
                        </div>
                      )}
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

export default ClassManagement;

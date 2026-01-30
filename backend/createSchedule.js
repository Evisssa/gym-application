
const admin = require('firebase-admin');
// Make sure you have serviceAccountKey.json in your backend folder
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- Configuration ---
const CLASS_DATA = [
  { className: 'Yoga', maxCapacity: 10 },
  { className: 'Zumba', maxCapacity: 15 },
  { className: 'Spinning', maxCapacity: 12 },
  { className: 'Crossfit', maxCapacity: 10 },
  { className: 'Pilates', maxCapacity: 8 },
];

const START_HOUR = 9;
const END_HOUR = 21; // This will create slots up to 21:00 - 22:00
const DAYS_TO_CREATE = 7; // Create schedule for the next 7 days

// --- Script ---

const createSchedules = async () => {
  const today = new Date();
  
  for (let i = 0; i < DAYS_TO_CREATE; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().slice(0, 10); // Format: YYYY-MM-DD

    console.log(`Processing schedule for date: ${dateString}`);

    const scheduleDocRef = db.collection('schedules').doc(dateString);
    
    // Check if a schedule for this date already exists
    const doc = await scheduleDocRef.get();
    if (doc.exists) {
        console.log(`Schedule for ${dateString} already exists. Skipping.`);
        continue; // Skip to the next day
    }

    const slotsCollectionRef = scheduleDocRef.collection('slots');
    const batch = db.batch();

    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      // Cycle through the class data for variety
      const classInfo = CLASS_DATA[hour % CLASS_DATA.length]; 
      
      const slotData = {
        className: classInfo.className,
        maxCapacity: classInfo.maxCapacity,
        registeredUsers: []
      };
      
      const slotDocRef = slotsCollectionRef.doc(timeSlot);
      batch.set(slotDocRef, slotData);
    }

    try {
      await batch.commit();
      console.log(`Successfully created schedule for ${dateString}!`);
    } catch (error) {
      console.error(`Error creating schedule for ${dateString}:`, error);
    }
  }
  console.log('Finished creating schedules.');
};

createSchedules();

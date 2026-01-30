
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const usersToCreate = [
  {
    email: 'admin@gym.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    email: 'member@gym.com',
    password: 'Member123!',
    role: 'Member'
  },
  {
    email: 'trainer@gym.com',
    password: 'Trainer123!',
    role: 'Trainer'
  }
];

const createUsersAndFirestoreEntries = async () => {
  for (const userData of usersToCreate) {
    let userRecord;
    try {
      // Try to create the user
      userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password
      });
      console.log(`Successfully created user: ${userData.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        // If user already exists, fetch the user record
        console.log(`User ${userData.email} already exists. Fetching user data.`);
        userRecord = await auth.getUserByEmail(userData.email);
      } else {
        // For other errors, log and continue to the next user
        console.error(`Error creating or fetching user ${userData.email}:`, error);
        continue;
      }
    }

    try {
      // Now, create the document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        role: userData.role,
        email: userData.email
      });
      console.log(`Successfully created Firestore entry for user: ${userData.email}`);
    } catch (firestoreError) {
      console.error(`Error creating Firestore entry for ${userData.email}:`, firestoreError);
    }
  }
};

createUsersAndFirestoreEntries();

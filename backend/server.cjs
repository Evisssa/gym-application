
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = 3001;

// More specific CORS configuration for Cloud Workstations
const allowedOrigins = ['http://localhost:5173','https://5173-firebase-gym-applicationgit-1769419969303.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev'];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

// Endpoint to create a new user
app.post('/createUser', async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    const userRole = role || 'member';
    const allowedRoles = ['admin', 'trainer', 'member'];
    if (!allowedRoles.includes(userRole)) {
        return res.status(400).send({ error: 'Invalid role specified' });
    }

    let userRecord;
    try {
        userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: `${firstName} ${lastName}`,
        });

        // Perform Firestore and custom claims updates in parallel
        const claimsPromise = admin.auth().setCustomUserClaims(userRecord.uid, { role: userRole });
        const firestorePromise = admin.firestore().collection('users').doc(userRecord.uid).set({
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: userRole,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        await Promise.all([claimsPromise, firestorePromise]);

        console.log('Successfully created new user:', userRecord.uid);
        const newUser = {
          id: userRecord.uid,
          name: `${firstName} ${lastName}`,
          email: email,
          role: userRole,
        };
        res.status(201).send(newUser);
    } catch (error) {
        console.error('Error creating new user:', error);
        // If the user was created in Auth but a subsequent step failed, roll back the user creation.
        if (userRecord) {
            await admin.auth().deleteUser(userRecord.uid);
            console.log('Cleaned up partially created user:', userRecord.uid);
        }
        res.status(500).send({ error: 'Failed to create user. An internal error occurred.' });
    }
});

// Endpoint to update a user
app.post('/updateUser', async (req, res) => {
    const { uid, firstName, lastName, role, age, phone } = req.body;

    if (!uid) {
        return res.status(400).send({ error: 'UID is required for update' });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (age) updateData.age = age;
    if (phone) updateData.phone = phone;
    if (role) {
        const allowedRoles = ['admin', 'trainer', 'member'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).send({ error: 'Invalid role specified' });
        }
        updateData.role = role;
    }

    try {
        // Use a transaction to ensure atomic update in Firestore
        await admin.firestore().runTransaction(async (transaction) => {
            const userRef = admin.firestore().collection('users').doc(uid);

            const authUpdatePromise = admin.auth().updateUser(uid, {
                displayName: `${firstName} ${lastName}`,
            });

            const claimsUpdatePromise = admin.auth().setCustomUserClaims(uid, { role: role });

            transaction.update(userRef, updateData);

            await Promise.all([authUpdatePromise, claimsUpdatePromise]);
        });
        
        const userRecord = await admin.auth().getUser(uid);

        console.log('Successfully updated user:', uid);
        const updatedUser = {
          id: userRecord.uid,
          name: userRecord.displayName,
          email: userRecord.email,
          role: (userRecord.customClaims && userRecord.customClaims.role) ? userRecord.customClaims.role : 'user',
        };
        res.status(200).send(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ error: 'Failed to update user' });
    }
});

// Endpoint to verify a token and get user data
app.post('/verifyToken', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).send({ error: 'Token is required' });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;
        const userRecord = await admin.auth().getUser(uid);
        res.status(200).send({ user: userRecord.toJSON() });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).send({ error: 'Invalid or expired token' });
    }
});


app.post('/deleteUser', async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).send({ error: 'UID is required' });
  }

  try {
    const firestorePromise = admin.firestore().collection('users').doc(uid).delete();
    const authPromise = admin.auth().deleteUser(uid);
    
    await Promise.all([firestorePromise, authPromise]);

    console.log(`Successfully deleted user with uid: ${uid}`);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ error: 'Failed to delete user' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

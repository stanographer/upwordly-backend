const firebase = require('firebase/app');
require('firebase/database');

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
};

firebase.initializeApp(config);

const db = firebase.database();

const user = uid => db.ref(`users/${ uid }`);

const job = key => db.ref(`jobs/${ key }`);

const jobsBySlug = slug => db.ref('jobs')
  .orderByChild('slug')
  .equalTo(slug);

module.exports = {
  user,
  job,
  jobsBySlug,
};

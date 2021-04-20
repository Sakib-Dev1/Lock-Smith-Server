const admin = require('firebase-admin');

const serviceAccount = require('./sakib-11-firebase-adminsdk-lb97t-10c73c0b0b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;

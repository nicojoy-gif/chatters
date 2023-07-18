const admin = require("firebase-admin");
const mailgun = require('mailgun.js');

const serviceaccount = require("./serviceAccountKey.json") // get json file from firebase console
admin.initializeApp({
  projectId: serviceaccount.project_id,
  credential: admin.credential.cert(serviceaccount),
  serviceAccountId:
    serviceaccount.client_email, //Tt is used for creating firebase auth credentials
});
exports.auth = admin.auth();

const mailgunConfig = {
  apiKey: 'a65a4c97262acf69a004b875bf368b92-135a8d32-102fabd2',
  domain: 'sandboxadd579fded2f42a99c99e0d0fd51c6cf.mailgun.org',
};

const mg = mailgun.client(mailgunConfig);

module.exports = { admin, mg };


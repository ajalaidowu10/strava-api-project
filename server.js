const express = require('express');
const PORT = 3000;

const app = express();

app.use(express.json());

const { fetchAndWriteActivityToGoogleSheet } = require('./index.js')

//App
app.get('/', (req, res) => {
  res.send('Hello World')
})

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {
  console.log("webhook event received!", req.query, req.body);
  fetchAndWriteActivityToGoogleSheet(req.body?.object_id);
  res.status(200).send('EVENT_RECEIVED');
});


// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = "STRAVA";
  // Parses the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Verifies that the mode and token sent are valid
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {     
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.json({"hub.challenge":challenge});  
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});


app.listen(PORT, () => {
  console.log(`Server started on port ${ PORT }`)
}).on('error', err => {
  console.log('ERROR: ', err)
})
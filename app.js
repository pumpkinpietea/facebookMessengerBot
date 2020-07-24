// Comments

'use strict';

// [START gae_node_request_example]
// set valiables
const PAGE_ACCESS_TOKEN = 'hogehogehoge'; // Your PAGE_ACCESS_TOKEN. Facebook provide us on developer site.
const VERIFY_TOKEN = 'hogehogehoge'; // Your verify token. Should be a random string.

// Imports dependencies and set up http server
const express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  app = express(); // creates express http server

// Sets server port and logs message on success
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('webhook is listening'));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Process application/json
app.use(bodyParser.json());

// Hello world!! for reply
app.get('/', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

// for Facebook verification
app.get('/webhook', (req, res) => {
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

app.post('/webhook/', function (req, res) {
  let messaging_events = req.body.entry[0].messaging;
  console.log(messaging_events);
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i];
    let sender = event.sender.id;
    //
    if (event.message && event.message.text) {
      let text = event.message.text;
      sendTextMessage(sender, 'あぁ、' + text.substring(0, 200) + 'なぁ〜');
    } else {
      sendTextMessage(sender, 'あぁ、それな〜');
    }
  }
  res.sendStatus(200);
});

function sendTextMessage(sender, text) {
  let messageData = { text: text };
  request(
    {
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: PAGE_ACCESS_TOKEN,
      },
      method: 'POST',
      json: {
        recipient: { id: sender },
        message: messageData,
      },
    },
    function (error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    }
  );
}

// [END gae_node_request_example]

module.exports = app;

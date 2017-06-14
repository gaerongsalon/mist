'use strict';

const awsServerlessExpress = require('aws-serverless-express');
const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
const bodyParser = require('body-parser');
const server = awsServerlessExpress.createServer(app);
const stupid = require('./stupid.js');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};
const client = new line.Client(config);

app.use(line.middleware(config));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.post('/webhook', (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(error => console.log(error));
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  if (
    event.replyToken === '00000000000000000000000000000000' ||
    event.replyToken === 'ffffffffffffffffffffffffffffffff'
  ) {
    return Promise.resolve(null);
  }
  console.log(event);

  const text = (event.message.text || '').trim().toLowerCase();
  const id = event.source.roomId || event.source.groupId || event.source.userId;
  return stupid
    .handle(id, text)
    .then(ret => {
      if (ret === null) {
        return true;
      }
      let texts = typeof ret === 'string' ? [ret] : ret;
      return client.replyMessage(
        event.replyToken,
        texts.map(text => {
          return {
            type: 'text',
            text: text
          };
        })
      );
    })
    .catch(console.log);
}

module.exports.express = (event, context) =>
  awsServerlessExpress.proxy(server, event, context);

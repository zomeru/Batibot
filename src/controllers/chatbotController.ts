import { Request, Response } from 'express';

interface BodyType {
  object: string;
  entry: {
    messaging: {
      sender: {
        id: string;
      };
      message: {
        text: string;
      };
    }[];
  }[];
}

export const test = async (_req: Request, res: Response) => {
  return res.send('Hello World');
};

export const getWebhook = (req: Request, res: Response) => {
  // Parse the query params
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      return res.sendStatus(403);
    }
  }
};

export const postWebhook = (req: Request, res: Response) => {
  // Parse the request body from the POST
  const body = req.body as BodyType;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      /// Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      const webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

// Handles messages events
function handleMessage(sender_psid: string, received_message: any) {}

// Handles messaging_postbacks events
function handlePostback(sender_psid: string, received_postback: any) {}

// Sends response messages via the Send API
function callSendAPI(sender_psid: string, response: any) {}

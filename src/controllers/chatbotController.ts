import { Request, Response } from 'express';

type ReceivedMessage = {
  text?: string;
  mid?: string;
  attachments?: {
    type: string;
    payload: {
      url: string;
    };
  }[];
};

type MessageResponse = {
  text?: string;
  attachment?: {
    type: string;
    payload: {
      template_type: string;
    };
  };
};

interface BodyType {
  object: string;
  entry: {
    messaging: {
      sender: {
        id: string;
      };
      recipient: {
        id: string;
      };
      timestamp: number;
      message: ReceivedMessage;
      postback: {
        title: string;
        payload: string;
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

      // Get the sender PSID
      const sender_psid = webhook_event?.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event?.message) {
        handleMessage(sender_psid!, webhook_event.message);
      } else if (webhook_event?.postback) {
        handlePostback(sender_psid!, webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

// Handles messages events
function handleMessage(sender_psid: string, received_message: ReceivedMessage) {
  let response: MessageResponse;

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    response = {
      text: `You sent a text message`,
    };
  }

  // Create the payload for attachment
  else if (received_message.attachments) {
    // Gets the URL of the message attachment
    const attachment_url = received_message.attachments[0]?.payload.url;
    response = {
      text: `You sent an attachment. ${attachment_url}`,
    };
  }

  // Sends the response message
  // @ts-ignore
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid: string, received_postback: any) {
  let response: MessageResponse;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { text: 'Thanks!' };
  } else if (payload === 'no') {
    response = { text: 'Oops, try sending another image.' };
  }
  // Send the message to acknowledge the postback
  // @ts-ignore
  callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid: string, response: MessageResponse) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  fetch(
    `https://graph.facebook.com/v2.6/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request_body),
    }
  )
    .then(() => {
      console.log('message sent!');
    })
    .catch(error => {
      console.error('Unable to send message:' + error);
    });
}

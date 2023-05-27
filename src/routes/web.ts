import express from 'express';

import {
  test,
  getWebhook,
  postWebhook,
} from '../controllers/chatbotController';

const router = express.Router();

const initWebRoutes = (app: express.Application) => {
  router.get('/', test);

  router.get('/webhook', getWebhook);
  router.post('/webhook', postWebhook);

  return app.use('/', router);
};

export default initWebRoutes;

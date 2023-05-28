import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import { viewEngine } from './config';
import initWebRoutes from './routes/web';

dotenv.config({ path: __dirname + '/.env' });

const app = express();

// config view engine
viewEngine(app);

app.set('port', process.env.PORT || 8000);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('public'));

// init all web routes
initWebRoutes(app);

app.listen(app.get('port'), () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Server is running at http://localhost:${app.get('port')}`);
  } else {
    console.log('Server is running');
  }
});

import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import viewEngine from './config/viewEngine';
import initWebRoutes from './routes/web';

dotenv.config();

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
  console.log({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    VERIFY_TOKEN: process.env.VERIFY_TOKEN,
    PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,
  });
  console.log(`Server is running at http://localhost:${app.get('port')}`);
});

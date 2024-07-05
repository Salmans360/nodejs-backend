const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/index');
const compression = require('compression');
require('dotenv').config();
const jobs = require('./jobs');
jobs;
const path = require('path');

const app = express();

app.use(compression());
app.use(express.json({ limit: '8000kb' }));
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT || 5000;
let whitelist = [];
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// CORS WHITELIST ARRAY
if (
  `${process.env.NODE_ENV}` === 'production'
) {
  whitelist = [
    'https://www.abc.co',
  ];
}

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  whitelist.push('http://localhost:3000');
}
if (process.env.NODE_ENV !== 'development') {
  app.use((req, res, next) => {
    if (req.headers['user-agent']) {
      if (req.headers['user-agent'].includes('Postman'))
        next(new Error('bloody postman', 403));
      next();
    } else {
      next();
    }
  });
  app.use('/api', cors(corsOptions), routes);
} else {
  app.use('/api', cors(), routes);
}

app.get('/', async (req, res) => {
  return res.send('Connected to POS Feature');
});

app.listen(port, async () => {
  console.log('POS server listening on port: ', port);
});

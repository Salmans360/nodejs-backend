const Sequelize = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV;
console.log(env, '<<<<<<<<<<<< env typed');

const dbConfig = require('./config.json')[env];

console.log(dbConfig, '<<<<<<<<< CON');

const db = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  },
);

module.exports = db;
// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'postgres',
//   database: 'test',
//   password: '12345',
//   host: 'localhost',
//   port: '5433',
// });

// module.exports = pool;

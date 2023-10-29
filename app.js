const express = require('express');
const mongoose = require('mongoose');
const winston = require('winston');
const { errors, celebrate, Joi } = require('celebrate');
const router = require('./routes/index');
const statusCodes = require('./utils/constants').HTTP_STATUS;
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');

const httpRegex = /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-/])*)?/;

const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

const app = express();
app.use(express.json());

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  login,
);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().regex(httpRegex),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  createUser,
);

app.use(auth);
app.use(router);
app.use(errors());

app.use((req, res) => {
  res
    .status(statusCodes.NOT_FOUND)
    .send({ message: 'Ошибка - 404 Страница не найдена' });
});

// app.use((err, req, res, next) => {
//   const { statusCode = 500, message } = err;

//   res
//     .status(statusCode)
//     .send({
//       message: statusCode === 500
//         ? 'Произошла ошибка на стороне сервера'
//         : message,
//     });
//   next();
// });
// app.use((error, req, res, next) => {
//   res.status(error.status || 500);
//   res.json({
//     status: error.status,
//     message: error.message || 'Произошла ошибка на стороне сервера',
//     stack: error.stack,
//   });
//   next();
// });

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Произошла ошибка на стороне сервера';
  logger.error(err.stack);
  res.status(statusCode).send({ message });
  next();
});

async function init() {
  await mongoose.connect(MONGO_URL);
  console.log('DB CONNECT');

  await app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}
init();

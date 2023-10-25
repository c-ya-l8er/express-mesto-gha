const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/index');
const statusCodes = require('./utils/constants').HTTP_STATUS;
const { login, createUser } = require('./controllers/users');

const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

const app = express();

app.post('/signin', login);
app.post('/signup', createUser);

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '651eee534aa75786ceb71ab8', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };
  next();
});

app.use(router);

app.use((req, res) => {
  res.status(statusCodes.NOT_FOUND).send({ message: 'Ошибка - 404 Страница не найдена' });
});

async function init() {
  await mongoose.connect(MONGO_URL);
  console.log('DB CONNECT');

  await app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}
init();

const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/index");

const { PORT = 3000, MONGO_URL = "mongodb://localhost:27017/mestodb" } =
  process.env;
const app = express();

app.use(express.json());

app.use(router);

async function init() {
  await mongoose.connect(MONGO_URL);
  console.log("DB CONNECT");

  await app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}
init();

app.use((req, res, next) => {
  req.user = {
    _id: "651eee534aa75786ceb71ab8", // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

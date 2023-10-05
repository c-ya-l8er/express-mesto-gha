const User = require("../models/user");

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((error) =>
      res
        .status(500)
        .send({ message: "Произошла ошибка на стороне сервера", error })
    );
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;

  User.findById(req.params.userId)
    .orFail(new Error("NotFound"))
    .then((user) => res.send({ data: user }))
    //.catch(() => res.status(500).send({ message: "Произошла ошибка" }));
    .catch((error) => {
      if (error.message === "NotFound") {
        return res
          .status(404)
          .send({ message: "Пользователь по id не найден" });
      }
      if (error.name === "CastError") {
        return res.status(400).send({ message: "Передан не валидный id" });
      }
      return res
        .status(500)
        .send({ message: "Произошла ошибка на стороне сервера", error });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
};

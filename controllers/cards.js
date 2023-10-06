const Card = require("../models/card");

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((error) => res
      .status(500)
      .send({ message: "Произошла ошибка на стороне сервера", error }));
};

module.exports.createCard = (req, res) => {
  // console.log(req.user._id); // _id станет доступен
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((error) => {
      if (error.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании карточки",
        });
      }
      return res
        .status(500)
        .send({ message: "Произошла ошибка на стороне сервера" });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndDelete(req.params.cardId)
    .orFail(new Error("NotFound"))
    .then((card) => res.status(200).send({ data: card }))
    .catch((error) => {
      if (error.message === "NotFound") {
        return res
          .status(404)
          .send({ message: "Карточка с указанным id не найдена" });
      }
      if (error.name === "CastError") {
        return res.status(400).send({
          message: "Переданы некорректные данные",
        });
      }
      return res
        .status(500)
        .send({ message: "Произошла ошибка на стороне сервера" });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("NotFound"))
    .then((card) => res.status(200).send({ data: card }))
    .catch((error) => {
      if (error.message === "NotFound") {
        return res
          .status(404)
          .send({ message: "Передан несуществующий id карточки" });
      }
      if (error.name === "CastError") {
        return res.status(400).send({
          message: "Переданы некорректные данные для постановки/снятии лайка",
        });
      }
      return res
        .status(500)
        .send({ message: "Произошла ошибка на стороне сервера" });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error("NotFound"))
    .then((card) => res.status(200).send({ data: card }))
    .catch((error) => {
      if (error.message === "NotFound") {
        return res
          .status(404)
          .send({ message: "Передан несуществующий id карточки" });
      }
      if (error.name === "CastError") {
        return res.status(400).send({
          message: "Переданы некорректные данные для постановки/снятии лайка",
        });
      }
      return res
        .status(500)
        .send({ message: "Произошла ошибка на стороне сервера" });
    });
};

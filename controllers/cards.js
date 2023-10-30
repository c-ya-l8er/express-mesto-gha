const { ValidationError, CastError } = require('mongoose').Error;
const Card = require('../models/card');
const statusCodes = require('../utils/constants').HTTP_STATUS;
const NOT_FOUND = require('../errors/NotFound');
const BAD_REQUEST = require('../errors/BadRequest');
const FORBIDDEN = require('../errors/Forbidden');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(statusCodes.OK).send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  // console.log(req.user._id); // _id станет доступен
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(statusCodes.CREATED).send({ data: card }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        next(new BAD_REQUEST('Переданы некорректные данные при создании карточки'));
      }
      return next(error);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new NOT_FOUND('NotFound'))
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        return next(new FORBIDDEN('Невозможно удалить карточку'));
      }
      return Card.deleteOne(card).then(() => res.status(statusCodes.OK).send({ data: card }));
    })
    .catch((error) => {
      if (error.message === 'NotFound') {
        next(new NOT_FOUND('Карточка с указанным id не найдена'));
      }
      if (error instanceof CastError) {
        next(new BAD_REQUEST('Переданы некорректные данные'));
      }
      return next(error);
    });
};

function changeLikeCardStatus(req, res, likeStatus, next) {
  Card.findByIdAndUpdate(req.params.cardId, likeStatus, { new: true })
    .orFail(new NOT_FOUND('NotFound'))
    .then((card) => res.status(statusCodes.OK).send({ data: card }))
    .catch((error) => {
      if (error.message === 'NotFound') {
        next(new NOT_FOUND('Передан несуществующий id карточки'));
      }
      if (error instanceof CastError) {
        next(new BAD_REQUEST('Переданы некорректные данные для постановки/снятия лайка'));
      }
      return next(error);
    });
}

module.exports.likeCard = (req, res) => {
  const likeStatus = { $addToSet: { likes: req.user._id } };
  changeLikeCardStatus(req, res, likeStatus);
};

module.exports.dislikeCard = (req, res) => {
  const likeStatus = { $pull: { likes: req.user._id } };
  changeLikeCardStatus(req, res, likeStatus);
};

const { ValidationError, CastError } = require('mongoose').Error;
const Card = require('../models/card');
const statusCodes = require('../utils/constants').HTTP_STATUS;

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(statusCodes.OK).send({ data: cards }))
    .catch((error) => res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: 'Произошла ошибка на стороне сервера', error }));
};

module.exports.createCard = (req, res) => {
  console.log(req.user._id); // _id станет доступен
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(statusCodes.CREATED).send({ data: card }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        return res.status(statusCodes.BAD_REQUEST).send({
          message: 'Переданы некорректные данные при создании карточки',
        });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: 'Произошла ошибка на стороне сервера' });
    });
};

// module.exports.deleteCard = (req, res) => {
//   Card.findByIdAndDelete(req.params.cardId)
//     .orFail(new Error('NotFound'))
//     .then((card) => res.status(statusCodes.OK).send({ data: card }))
//     .catch((error) => {
//       if (error.message === 'NotFound') {
//         return res
//           .status(statusCodes.NOT_FOUND)
//           .send({ message: 'Карточка с указанным id не найдена' });
//       }
//       if (error instanceof CastError) {
//         return res.status(statusCodes.BAD_REQUEST).send({
//           message: 'Переданы некорректные данные',
//         });
//       }
//       return res
//         .status(statusCodes.INTERNAL_SERVER_ERROR)
//         .send({ message: 'Произошла ошибка на стороне сервера' });
//     });
// };

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        return next(new Error('Невозможно удалить карточку'));
      }
      return Card.deleteOne(card).then(() => res.status(statusCodes.OK).send({ data: card }));
    })
    .catch((error) => {
      if (error.message === 'NotFound') {
        return res
          .status(statusCodes.NOT_FOUND)
          .send({ message: 'Карточка с указанным id не найдена' });
      }
      if (error instanceof CastError) {
        return res.status(statusCodes.BAD_REQUEST).send({
          message: 'Переданы некорректные данные',
        });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: 'Произошла ошибка на стороне сервера' });
    });
};

function changeLikeCardStatus(req, res, likeStatus) {
  Card.findByIdAndUpdate(req.params.cardId, likeStatus, { new: true })
    .orFail(new Error('NotFound'))
    .then((card) => res.status(statusCodes.OK).send({ data: card }))
    .catch((error) => {
      if (error.message === 'NotFound') {
        return res
          .status(statusCodes.NOT_FOUND)
          .send({ message: 'Передан несуществующий id карточки' });
      }
      if (error instanceof CastError) {
        return res.status(statusCodes.BAD_REQUEST).send({
          message: 'Переданы некорректные данные для постановки/снятии лайка',
        });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: 'Произошла ошибка на стороне сервера' });
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

// module.exports.likeCard = (req, res) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $addToSet: { likes: req.user._id } },
//     { new: true },
//   )
//     .orFail(new Error('NotFound'))
//     .then((card) => res.status(200).send({ data: card }))
//     .catch((error) => {
//       if (error.message === 'NotFound') {
//         return res
//           .status(404)
//           .send({ message: 'Передан несуществующий id карточки' });
//       }
//       if (error instanceof CastError) {
//         return res.status(400).send({
//           message: 'Переданы некорректные данные для постановки/снятии лайка',
//         });
//       }
//       return res
//         .status(500)
//         .send({ message: 'Произошла ошибка на стороне сервера' });
//     });
// };

// module.exports.dislikeCard = (req, res) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $pull: { likes: req.user._id } },
//     { new: true },
//   )
//     .orFail(new Error('NotFound'))
//     .then((card) => res.status(200).send({ data: card }))
//     .catch((error) => {
//       if (error.message === 'NotFound') {
//         return res
//           .status(404)
//           .send({ message: 'Передан несуществующий id карточки' });
//       }
//       if (error instanceof CastError) {
//         return res.status(400).send({
//           message: 'Переданы некорректные данные для постановки/снятии лайка',
//         });
//       }
//       return res
//         .status(500)
//         .send({ message: 'Произошла ошибка на стороне сервера' });
//     });
// };

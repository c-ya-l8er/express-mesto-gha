const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();

const httpRegex = /^(http:\/\/|https:\/\/)(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9]{2,8})((\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?(#[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+)?)?$/;
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);
router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      link: Joi.string().pattern(httpRegex).required(),
    }),
  }),
  createCard,
);
router.delete(
  '/:cardId',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().length(24).hex().required(),
    }),
  }),
  deleteCard,
);
router.put(
  '/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().length(24).hex().required(),
    }),
  }),
  likeCard,
);
router.delete(
  '/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().length(24).hex().required(),
    }),
  }),
  dislikeCard,
);

module.exports = router;

const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();

const httpRegex = /^(http:\/\/|https:\/\/)(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9]{2,8})((\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?(#[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+)?)?$/;
const {
  getUsers,
  getUserById,
  getCurrentUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get(
  '/:userId',
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().length(24).hex().required(),
    }),
  }),
  getUserById,
);
router.get('/me', getCurrentUser);
router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      about: Joi.string().min(2).max(30).required(),
    }),
  }),
  updateProfile,
);
router.patch(
  '/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().pattern(httpRegex).required(),
    }),
  }),
  updateAvatar,
);

module.exports = router;

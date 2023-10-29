const { ValidationError, CastError } = require('mongoose').Error;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const statusCodes = require('../utils/constants').HTTP_STATUS;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(statusCodes.OK).send({ data: users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(statusCodes.OK).send({ data: user }))
    .catch((error) => {
      if (error.message === 'NotFound') {
        return res
          .status(statusCodes.NOT_FOUND)
          .send({ message: ' Пользователь по указанному id не найден' });
      }
      if (error instanceof CastError) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .send({ message: 'Передан не валидный id' });
      }
      return next(error);
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  // console.log(req.user._id);
  User.findById(userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(statusCodes.OK).send({ data: user }))
    .catch((error) => {
      if (error.message === 'NotFound') {
        return res
          .status(statusCodes.NOT_FOUND)
          .send({ message: ' Пользователь по указанному id не найден' });
      }
      if (error instanceof CastError) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .send({ message: 'Передан не валидный id' });
      }
      return next(error);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(statusCodes.CREATED).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((error) => {
      if (error instanceof ValidationError) {
        return res.status(statusCodes.BAD_REQUEST).send({
          message: 'Переданы некорректные данные при создании пользователя',
        });
      }
      if (error.code === 11000) {
        return res.status(statusCodes.CONFLICT || 409).send(
          new Error(
            'Пользователь пытается зарегистрироваться по уже существующему в базе email',
          ),
        );
      }
      return next(error);
    });
};

function updateUser(req, res, newData, next) {
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, newData, { new: true, runValidators: true })
    .orFail(new Error('NotFound'))
    .then((user) => res.status(statusCodes.OK).send({ data: user }))
    .catch((error) => {
      if (error.message === 'NotFound') {
        return res
          .status(statusCodes.NOT_FOUND)
          .send({ message: 'Пользователь с указанным id не найден' });
      }
      if (error instanceof ValidationError) {
        return res.status(statusCodes.BAD_REQUEST).send({
          message: 'Переданы некорректные данные при обновлении профиля',
        });
      }
      return next(error);
    });
}

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  updateUser(req, res, { name, about });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  updateUser(req, res, { avatar });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, 'super-puper-secret', {
          expiresIn: '7d',
        }),
      });
    })
    .catch((error) => {
      res.status(401).send({ message: error.message });
      next(error);
    });
};

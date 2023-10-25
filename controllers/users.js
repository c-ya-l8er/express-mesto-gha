const { ValidationError, CastError } = require('mongoose').Error;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const statusCodes = require('../utils/constants').HTTP_STATUS;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(statusCodes.OK).send({ data: users }))
    .catch((error) => res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: 'Произошла ошибка на стороне сервера', error }));
};

module.exports.getUserById = (req, res) => {
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
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: 'Произошла ошибка на стороне сервера' });
    });
};

module.exports.getCurrentUser = (req, res) => {
  const { userId } = req.user._id;
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
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: 'Произошла ошибка на стороне сервера' });
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
    .then((user) => res.status(statusCodes.CREATED).send({ data: user }))
    .catch((error) => {
      if (error instanceof ValidationError) {
        return res.status(statusCodes.BAD_REQUEST).send({
          message: 'Переданы некорректные данные при создании пользователя',
        });
      }
      if (error.code === 11000) {
        next(new Error('Пользователь пытается зарегистрироваться по уже существующему в базе email'));
      } else {
        next(error);
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: 'Произошла ошибка на стороне сервера' });
    });
};

function updateUser(req, res, newData) {
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
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: 'Произошла ошибка на стороне сервера' });
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

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, 'super-puper-secret', { expiresIn: '7d' }),
      });
    })
    .catch((err) => {
      res.status(statusCodes.UNAUTHORIZED).send({ message: err.message });
    });
};

// module.exports.updateProfile = (req, res) => {
//   const { name, about } = req.body;
//   const userId = req.user._id;
//   User.findByIdAndUpdate(
//     userId,
//     { name, about },
//     { new: true, runValidators: true },
//   )
//     .orFail(new Error('NotFound'))
//     .then((user) => res.status(200).send({ data: user }))
//     .catch((error) => {
//       if (error.message === 'NotFound') {
//         return res
//           .status(404)
//           .send({ message: 'Пользователь с указанным id не найден' });
//       }
//       if (error instanceof ValidationError) {
//         return res.status(400).send({
//           message: 'Переданы некорректные данные при обновлении профиля',
//         });
//       }
//       return res
//         .status(500)
//         .send({ message: 'Произошла ошибка на стороне сервера' });
//     });
// };

// module.exports.updateAvatar = (req, res) => {
//   const { avatar } = req.body;
//   const userId = req.user._id;
//   User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true})
//     .orFail(new Error('NotFound'))
//     .then((user) => res.status(200).send({ data: user }))
//     .catch((error) => {
//       if (error.message === 'NotFound') {
//         return res
//           .status(404)
//           .send({ message: 'Пользователь с указанным id не найден' });
//       }
//       if (error instanceof ValidationError) {
//         return res.status(400).send({
//           message: ' Переданы некорректные данные при обновлении аватара',
//         });
//       }
//       return res
//         .status(500)
//         .send({ message: 'Произошла ошибка на стороне сервера' });
//     });
// };

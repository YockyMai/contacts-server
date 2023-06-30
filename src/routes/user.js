const { Router } = require("express");
const db = require("../models");
const apiError = require("../error/api-error");
const generateJwt = require("../utils/generate-jwt");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/auth-middleware");
const { body, validationResult } = require("express-validator");

const userRouter = Router();

userRouter.post(
  "/login",
  [
    body("username")
      .notEmpty()
      .withMessage("Имя пользователя обязательно для заполнения")
      .isLength({ min: 3, max: 20 })
      .withMessage("Длина имени должна быть от 3 до 5 символов"),
    body("password")
      .notEmpty()
      .withMessage("Пароль обязательен для заполнения")
      .isLength({ min: 8, max: 50 })
      .withMessage("Длина пароля должна быть от 8 до 50 символов"),
  ],
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return next(apiError.badRequest(validationErrors));
      }

      const { username, password } = req.body;
      const user = await db.User.findOne({ where: { username } });
      if (!user) {
        return next(
          apiError.badRequest({
            errors: [{ msg: "Такой пользователь не найден" }],
          })
        );
      }

      let comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(
          apiError.badRequest({
            errors: [{ msg: "Неверное имя пользователя или пароль" }],
          })
        );
      }

      const token = generateJwt(user.id, user.username);

      return res.json({ token });
    } catch (e) {
      return next(apiError.internal(e.message));
    }
  }
);

userRouter.post(
  "/registration",
  [
    body("username")
      .notEmpty()
      .withMessage("Имя пользователя обязательно для заполнения")
      .isLength({ min: 3, max: 20 })
      .withMessage("Длина имени должна быть от 3 до 5 символов"),
    body("password")
      .notEmpty()
      .withMessage("Пароль обязательен для заполнения")
      .isLength({ min: 8, max: 50 })
      .withMessage("Длина пароля должна быть от 8 до 50 символов"),
  ],
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return next(apiError.badRequest(validationErrors));
      }

      const { password, username } = req.body;

      const candidate = await db.User.findOne({ where: { username } });

      if (candidate) {
        return next(
          apiError.badRequest({
            errors: [{ msg: "Пользователь с таким именем уже существует!" }],
          })
        );
      }

      let hashPassword = bcrypt.hashSync(password, 5);

      const user = await db.User.create({
        username,
        password: hashPassword,
      });

      const token = generateJwt(user.id, user.username);

      return res.json({
        token,
      });
    } catch (e) {
      return next(apiError.internal(e.message));
    }
  }
);

userRouter.get("/check", authMiddleware, (req, res) => {
  const token = generateJwt(req.user.id, req.user.username);

  return res.json(token);
});

module.exports = userRouter;

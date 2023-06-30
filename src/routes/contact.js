const { Router } = require("express");
const db = require("../models");
const apiError = require("../error/api-error");
const authMiddleware = require("../middleware/auth-middleware");
const { where, fn, col } = require("sequelize");
const { body, validationResult } = require("express-validator");

const contactsRouter = Router();

contactsRouter.post(
  "/create",
  [
    body("name")
      .notEmpty()
      .withMessage("Имя обязательено для заполнения")
      .isLength({ min: 2, max: 30 })
      .withMessage("Длина имени должна быть от 2 до 30 символов"),
    body("phone")
      .notEmpty()
      .withMessage("Номер телефона обязательен для заполнения")
      .isLength(11)
      .withMessage("Неверный формат номера телефона"),
  ],
  authMiddleware,
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return next(apiError.badRequest(validationErrors));
      }

      const { phone, name } = req.body;
      const user = req.user;

      const contact = await db.Contact.create({ phone, userId: user.id, name });

      return res.json({ contact });
    } catch (e) {
      return next(apiError.internal(e.message));
    }
  }
);

contactsRouter.delete("/delete", authMiddleware, async (req, res, next) => {
  try {
    const { contactId } = req.query;

    if (!contactId) return next(apiError.badRequest("ID не указан"));

    const deletedContact = await db.Contact.destroy({
      where: { id: contactId },
    });

    return res.json({ deletedContact });
  } catch (e) {
    return next(apiError.internal(e.message));
  }
});

contactsRouter.post(
  "/edit",
  [
    body("name")
      .notEmpty()
      .withMessage("Имя обязательено для заполнения")
      .isLength({ min: 2, max: 30 })
      .withMessage("Длина имени должна быть от 2 до 30 символов"),
    body("phone")
      .notEmpty()
      .withMessage("Номер телефона обязательен для заполнения")
      .isLength(11)
      .withMessage("Неверный формат номера телефона"),
  ],
  authMiddleware,
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return next(apiError.badRequest(validationErrors));
      }

      const { name, phone, id } = req.body;

      const contact = await db.Contact.findOne({
        where: {
          id,
        },
      });

      contact.name = name;
      contact.phone = phone;

      await contact.save();

      return res.json({ contact });
    } catch (e) {
      return next(apiError.internal(e.message));
    }
  }
);

contactsRouter.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { search } = req.query;
    const user = req.user;

    const contacts = await db.Contact.findAll({
      where: {
        userId: user.id,
        ...(search && {
          name: where(
            fn("LOWER", col("Contact.name")),
            "LIKE",
            "%" + search.toLowerCase() + "%"
          ),
        }),
      },
    });

    return res.json({ contacts });
  } catch (e) {
    return next(apiError.internal(e.message));
  }
});

module.exports = contactsRouter;

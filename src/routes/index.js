const { Router } = require("express");
const userRouter = require("./user.js");
const contactsRouter = require("./contact");

const router = Router();

router.use("/user", userRouter);
router.use("/contact", contactsRouter);

module.exports = router;

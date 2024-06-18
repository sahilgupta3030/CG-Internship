const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { userSchema, updateUserSchema } = require("../schemas/userSchema");
const validate = require("../middlewares/validate");

router.get("/complete", userController.completeUsers);
router.get("/", userController.getUsers);
router.put("/:id", validate(updateUserSchema), userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/", validate(userSchema), userController.insertUser);

module.exports = router;
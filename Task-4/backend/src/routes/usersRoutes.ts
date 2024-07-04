import express, { Request, Response, Router } from "express";
import userController from "../controllers/userController";
import { createUserSchema, updateUserSchema } from "../schemas/userSchema";
import validate from "../middlewares/validate";

const router: Router = express.Router();

router.get("/complete", (req: Request, res: Response) => userController.completeUsers(req, res));
router.get("/", (req: Request, res: Response) => userController.getUsers(req, res));
router.put("/:id", validate(updateUserSchema), (req: Request, res: Response) => userController.updateUser(req, res));
router.delete("/:id", (req: Request, res: Response) => userController.deleteUser(req, res));
router.post("/", validate(createUserSchema), (req: Request, res: Response) => userController.insertUser(req, res));

export default router;

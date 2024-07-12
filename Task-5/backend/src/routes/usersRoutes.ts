import express, { Request, Response, Router } from "express";
import userController from "../controllers/userController";
import loginController from "../controllers/loginController";
import imageController from "../controllers/imageController";
import { createUserSchema, updateUserSchema } from "../schemas/userSchema";
import validate from "../middlewares/validate";
import { authMiddleware } from "../middlewares/auth";


const router: Router = express.Router();

router.post('/register', (req: Request, res: Response) => loginController.registerUser(req, res));
router.post('/login', (req: Request, res: Response) => loginController.loginUser(req, res));
router.post('/logout', authMiddleware, (req: Request, res: Response) => loginController.logoutUser(req, res));

router.get("/complete", authMiddleware, (req: Request, res: Response) => userController.completeUsers(req, res));
router.get("/", authMiddleware, (req: Request, res: Response) => userController.getUsers(req, res));
router.post("/", authMiddleware, validate(createUserSchema), (req: Request, res: Response) => userController.insertUser(req, res));
router.put("/:id", authMiddleware, validate(updateUserSchema), (req: Request, res: Response) => userController.updateUser(req, res));
router.delete("/:id", authMiddleware, (req: Request, res: Response) => userController.deleteUser(req, res));


router.post('/upload', authMiddleware, (req: Request, res: Response) => imageController.uploadImage(req, res));
router.get('/image', authMiddleware, (req: Request, res: Response) => imageController.getImages(req, res));

export default router;





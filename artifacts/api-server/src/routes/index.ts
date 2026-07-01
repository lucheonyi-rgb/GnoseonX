import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import messagesRouter from "./messages";
import friendsRouter from "./friends";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(messagesRouter);
router.use(friendsRouter);

export default router;

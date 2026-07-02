import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import messagesRouter from "./messages";
import friendsRouter from "./friends";
import dmsRouter from "./dms";
import storageRouter from "./storage";
import storiesRouter from "./stories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(messagesRouter);
router.use(friendsRouter);
router.use(dmsRouter);
router.use(storageRouter);
router.use(storiesRouter);

export default router;

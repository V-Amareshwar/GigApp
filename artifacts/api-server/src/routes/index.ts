import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import categoriesRouter from "./categories";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import reviewsRouter from "./reviews";
import chatRouter from "./chat";
import notificationsRouter from "./notifications";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(reviewsRouter);
router.use(chatRouter);
router.use(notificationsRouter);
router.use(statsRouter);

export default router;

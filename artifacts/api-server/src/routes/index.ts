import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import emailRouter from "./email";
import authRouter from "./auth";
import customersRouter from "./customers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(customersRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(emailRouter);

export default router;

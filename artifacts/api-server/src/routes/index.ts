import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import emailRouter from "./email";
import authRouter from "./auth";
import customersRouter from "./customers";
import adminRouter from "./admin";
import productsAdminRouter from "./products-admin";
import couponsRouter from "./coupons";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(customersRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(emailRouter);
router.use(adminRouter);
router.use(productsAdminRouter);
router.use(couponsRouter);

export default router;

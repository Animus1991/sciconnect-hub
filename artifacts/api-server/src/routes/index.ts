import { Router, type IRouter } from "express";
import healthRouter from "./health";
import canvasAiRouter from "./canvas-ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/canvas-ai", canvasAiRouter);

export default router;

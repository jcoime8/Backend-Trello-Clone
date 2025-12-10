import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middlawares";
import { getTask, createTask, deleteTask, putTasks } from "../controllers/task.controller";


const router = Router();

router.get("/", verifyToken, getTask)
router.post("/", verifyToken, createTask)
router.put("/:id", verifyToken, putTasks)
router.delete("/:id", verifyToken, deleteTask)


export default router;
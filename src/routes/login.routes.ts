import { LoginUser, Logout, registerUser } from "../controllers/auth.Controller";
import { Router } from "express";

const r = Router();

r.post("/register", registerUser)
r.post("/login", LoginUser)
r.post("/logout", Logout)

export default r
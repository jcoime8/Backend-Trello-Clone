import  express  from "express";
import cors from 'cors'
import r from "./routes/login.routes";
import cookieParser from "cookie-parser";
import router from "./routes/tast.Routes";


const app = express();
const PORT = process.env.PORT || 4000


app.use(express.json())
app.use(cors({
    origin: [
        "https://frontend-trello-clone.vercel.app",
        "http://localhost:5173"
    ], 
    credentials: true
}))

app.use(cookieParser())

app.use("/api/auth", r)
app.use("/api/tasks", router)

app.listen(PORT, () => {
    console.log(`Puerto abierto corriendo en http://localhost:${PORT}`)
})
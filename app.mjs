import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { config } from "./config.mjs"
import { connectDB } from "./db/user_database.mjs"
import authRouter from "./router/auth.mjs"

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

app.use("/auth", authRouter)

app.use((req, res) => {
    res.sendStatus(404)
})

connectDB().then(() => {
    app.listen(config.host.port, () => {
        console.log("웹 서버 실행 중 ...")
    })
}).catch((err) => { 
    console.log("서버 연결 실패")
    console.error(err)
})
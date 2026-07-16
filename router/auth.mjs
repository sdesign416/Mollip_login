import express from "express"
import * as authController from "../controller/auth.mjs"

const router = express.Router()

// 아이디 중복 확인
router.get("/checkId", authController.checkId)

// 회원가입
router.post("/signup", authController.signup)

export default router
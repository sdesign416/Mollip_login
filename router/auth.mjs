import express from "express"
import * as authController from "../controller/auth.mjs"
import { isAuth } from "../middleware/auth.mjs"
import { uploadProfile } from "../middleware/profile_upload.mjs"

const router = express.Router()

// 아이디 중복 확인
router.get("/checkId", authController.checkId)

// 회원가입
router.post("/signup", authController.signup)

// 로그인
router.post("/login", authController.login)

// 로그인 유지 체크 + 회원 정보 조회
router.get("/me", isAuth, authController.me)

// 로그아웃
router.post("/logout", authController.logout)

// 회원 정보 수정
router.patch("/me", isAuth, authController.meUpdate)

// 프로필 이미지 수정
router.patch(
    "/profile-image", 
    isAuth, 
    uploadProfile.single("profileImage"),
    authController.updateProfileImage
)

export default router
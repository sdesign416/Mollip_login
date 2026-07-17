import express from "express"
import { config } from "../config.mjs"
import * as bcrypt from "bcrypt"
import * as authRepository from "../repository/auth.mjs"
import jwt from "jsonwebtoken"


// 회원 중복 체크
export async function checkId(req, res) {
    const { userid } = req.query
    const found = await authRepository.findByUserid(userid)
    res.json({ exists: !!found })
}

// 회원가입
export async function signup(req, res) {
    const{userid, userpw, nickname, username, email} = req.body
    
    // ID 중복체크
    const found = await authRepository.findByUserid(userid)
    if(found){
        return res.status(409).json({message: `${userid}는 이미 존재하는 ID입니다.`})
    }

    // 비밀번호 해쉬화
    const hashed = bcrypt.hashSync(userpw, config.bcrypt.saltRounds)

    // 실제 가입
    const userInsertedId = await authRepository.createUser(
        {userid, userpw: hashed, nickname, username, email, createdAt: new Date()}
    )

    // 가입완료 후
    const token = await createJwtToken(userInsertedId)

    // 확인용
    console.log("회원가입 성공, 토큰발급 완료!!")
    res.status(201).json({token, userInsertedId})
}

// JWT 토큰 생성
async function createJwtToken(id) {
    return jwt.sign({id}, config.jwt.secretKey, {
        expiresIn: config.jwt.expiresInSec
    })    
}

// 로그인
export async function login(req, res) {
    const {userid, userpw} = req.body

    // ID 확인
    const user = await authRepository.findByUserid(userid)
    if(!user){
        console.log("존재하지 않는 ID 입력")
        return res.status(401).json({message: "아이디 또는 비밀번호를 확인해주세요"})
    }

    // 비밀번호 확인
    const isValidPw = await bcrypt.compare(userpw, user.userpw)
    if(!isValidPw){
        console.log("일치하지 않는 비밀번호 입력")
        return res.status(401).json({message: "아이디 또는 비밀번호를 확인해주세요"})
    }

    // 모두 일치하면 토큰발급
    const token = await createJwtToken(user._id.toString())
    const { userpw: _, ...safeUser } = user // 비밀번호 보안처리
    console.log("로그인 성공 및 토큰 발급 완료")
    return res.status(200).json({token, user: safeUser})
}

// 로그인 유지 체크
export async function me(req, res) {
    const {userpw, ...safeUser} = req.user
    res.status(200).json({token: req.token, user: safeUser})
}

// 로그아웃
export async function logout(req, res) {
    console.log("로그아웃 성공")
    res.status(200).json({message: "로그아웃되었습니다."})
}

// 회원 정보 수정 [nickname, username, email]
export async function meUpdate(req, res) {
    const {nickname, username, email} = req.body

    // 로그인 한 사용자 조회
    const user = await authRepository.findById(req.user._id)
    if (!user) {
        return res.status(404).json({message: "회원정보를 찾을 수 없습니다."})
    }

    // 수정
    const updatedUser = await authRepository.update(
        req.user._id, nickname, username, email
    )

    // 비밀번호 제외 응답 (보안)
    const { userpw, ...safeUser } = updatedUser

    return res.status(200).json({
        message: "회원정보가 수정되었습니다.",
        user: safeUser
    })
}
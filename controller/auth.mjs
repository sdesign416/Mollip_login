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
        {userid, userpw: hashed, nickname, username, email}
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

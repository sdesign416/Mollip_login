import MongoDB from "mongodb"
import {getUser} from "../db/user_database.mjs"


// id 중복확인
export async function findByUserid(userid) {
    return getUser().find({userid}).next().then(mapOptionalUser)
}

function mapOptionalUser(user) {
    return user ? { ...user, id: user._id.toString() } : user
}

// 회원가입
export async function createUser(user) {
    return getUser().insertOne(user).then((result) => result.insertedId.toString())
}

// 로그인 유지
export async function findById(id) {
    return getUser().find({ _id: new MongoDB.ObjectId(id) }).next().then(mapOptionalUser)
}
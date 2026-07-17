const logoutBtn = document.getElementById("logoutBtn")

const profileForm = document.getElementById("profileForm")
const profileUserid = document.getElementById("profileUserid")
const nickname = document.getElementById("nickname")
const username = document.getElementById("username")
const email = document.getElementById("email")

const editBtn = document.getElementById("editBtn")
const editAct = document.getElementById("editAct")
const cancelBtn = document.getElementById("cancelBtn")
const submitBtn = document.getElementById("submitBtn")

// 로그아웃
logoutBtn.addEventListener("click", () => {
    // confirm = true/false 반환값
    const check = confirm("로그아웃 하시겠습니까?")
    if(!check) return // 취소(false)

    // JWT 토큰 삭제
    localStorage.removeItem("token")
    localStorage.removeItem("userid")
    // console.log("로그아웃 완료")
    
    // 다시 메인이동
    window.location.href = "/login.html"
})

// 페이지 열리면 회원정보 불러 옴
window.addEventListener("DOMContentLoaded", () => {
    getUser()
})

// 회원정보 조회
async function getUser() {
    // 토큰 있어야만 페이지 접속가능
    const token = localStorage.getItem("token")
    if(!token){
        alert("로그인 후 서비스이용이 가능합니다.")
        location.href = "/login.html"
        return
    }

    // 회원정보 서버에 요청
    try{
        const response = await fetch("/auth/me", {
            method: "GET",
            headers: {Authorization: `Bearer ${token}`}
        })

        const data = await response.json()
        if(!response.ok){
            alert(data.message)
            localStorage.removeItem("token")
            location.href = "/login.html"
            return
        }

        // 서버에서 받아 온 정보 출력
        const user = data.user
        profileUserid.textContent = user.userid
        nickname.value = user.nickname
        username.value = user.username
        email.value = user.email

        console.log("회원정보:", user)
    }catch (error) {
        console.error("회원정보 조회 오류:", error)
        alert("회원정보를 불러오지 못했습니다.")
    }
}

// 우측 수정버튼 클릭
editBtn.addEventListener("click", () => {
    // 입력창 수정가능하게
    nickname.disabled = false
    username.disabled = false
    email.disabled = false

    // 하단 버튼 활성화
    editAct.classList.remove("hidden")
    editBtn.classList.add("hidden")
})

// 취소버튼 클릭
cancelBtn.addEventListener("click", () => {
    // 입력창 수정 불가능
    nickname.disabled = true
    username.disabled = true
    email.disabled = true

    // 하단 버튼 비활성화
    editAct.classList.add("hidden")
    editBtn.classList.remove("hidden")

    // 서버의 기존 회원정보를 다시 불러옴
    getUser()
})

// 저장 버튼 클릭
profileForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    // 수정할 회원정보
    const token = localStorage.getItem("token")
    const updateUser = {
        nickname: nickname.value.trim(),
        username: username.value.trim(),
        email: email.value.trim()
    }
    // console.log("수정할 회원정보:", updateUser)


    try {
        const response = await fetch("auth/me", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updateUser)
        })

        const data = await response.json()
        if (!response.ok) {
            alert(data.message)
            return
        }
        alert("회원정보가 수정되었습니다.")

        // 수정완료 후 입력창 잠금
        nickname.disabled = true
        username.disabled = true
        email.disabled = true

        // 하단버튼 비활성화
        editAct.classList.add("hidden")
        editBtn.classList.remove("hidden")

    } catch (error) {
        console.error("회원정보 수정 오류:", error)
        alert("회원정보 수정에 실패했습니다.")
    }
})
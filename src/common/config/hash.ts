import * as argon2 from "argon2"

async function HashingPassword(password:string) {
    return await argon2.hash(password)
}

async function PasswordVerify( hashedPassword:string , password:string ) {
    return await argon2.verify( hashedPassword , password )
}

export default { HashingPassword , PasswordVerify }
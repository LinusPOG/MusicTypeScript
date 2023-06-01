import { invalid, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions, Action } from './$types';

import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const load: PageServerLoad = async ({request, url}) => {
    const isReg = url.searchParams.get("reg")
    
    return {isReg};
};

function GetExpire(){
    let now = new Date();
    const time = now.getTime();
    const expireTime = time + 1000 * 60 * 60 * 24 * 30;
    now.setTime(expireTime);
    return now
}

const login: Action = async ({ cookies, request }) => {
    const data = await request.formData()
    const [username, password] = [data.get("user"), data.get("pass")]

    if (typeof(username) != "string" || typeof(password) != "string" || !username || !password){
        return invalid(400, {invalid: true})
    }

    let result = await prisma.user.findUnique({where:{name:username},})
    if(result?.password==password)
    {
        const token = uuidv4()
        await prisma.user.update({where:{name:username}, data:{token}})
        cookies.set("token", token, {expires: GetExpire()})

        throw redirect(302, "/songs")
    } else {
        return invalid(404,{message:"user not found"})
    }    
}

const register: Action = async ({ cookies, request }) => {
    const data = await request.formData()
    const [username, password, email] = [data.get("user"), data.get("pass"), data.get("email")]

    if (typeof(username) != "string" || typeof(password) != "string" || typeof(email) != "string" || !username || !password || !email){
        return invalid(400, {invalid: true})
    }
    console.log("Registering!")

    const token = uuidv4()
    await prisma.user.create({data:{name:username,password,email,token}})
    cookies.set("token", token, {expires: GetExpire()})

    throw redirect(302, "/songs")
}

export const actions: Actions = { login, register }
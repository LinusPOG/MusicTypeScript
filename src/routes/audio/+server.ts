import type { RequestHandler } from './$types';
import { Readable } from "node:stream";
import fs from "fs"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const userListening: any = {}

export const GET: RequestHandler = async ({cookies, url}) => {
    const token = cookies.get("token")
    if (token){
        console.log("Token =", token)
        const user = await prisma.user.findUnique({where:{token}})

        if (user){
            const setID = url.searchParams.get("id")
            if (setID) {
                const ID = parseInt(setID)
                console.log("SONG ID =", ID)
                await prisma.user.update({where:{id:user.id}, data:{playing: ID}})
                
                return new Response("ok!")
            } else {
                console.log("NO ID")
                const songID = user.playing
                if (songID){
                    console.log("Sending song!")
                    const stream = await fs.createReadStream(`songs/${songID.toString()}.mp3`)
            
                    return new Response(stream)
                }
            }
        }
    }
    return new Response("Error")
};
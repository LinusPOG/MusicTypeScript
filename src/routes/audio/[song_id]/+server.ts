import type { RequestHandler } from './$types';
import fs from "fs"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const userListening: any = {}

export const GET: RequestHandler = async ({cookies, params}) => {
    const token = cookies.get("token")
    if (token){
        console.log("Token =", token)
        const user = await prisma.user.findUnique({where:{token}})

        if (user){
            const songID = params.song_id
            let song = await prisma.song.findFirst({where:{id: parseInt(songID)}})
            if (song == undefined){
                song = await prisma.song.findFirst({})
                console.log("SENDING DEFAULT =", song)
            }
            // const stream = await fs.createReadStream(`songs/${songID}.mp3`)
    
            // return new Response(stream)
            if (song != undefined){
                //const stream = await fs.createReadStream(`songs/${song.id}.mp3`)
                const file = await fs.readFileSync(`songs/${song.id}.mp3`)
                return new Response(file, {
                    headers: {
                        "Accept-Ranges": "bytes",
                        "Content-Range": "bytes <some bytes>/<total bytes>",
                        "Content-Length": file.byteLength.toString(),
                        "Content-Type": "audio/mp3",
                    }
                })
            }
        }
    }
    return new Response("Error")
};
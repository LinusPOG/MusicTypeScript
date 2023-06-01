import type { RequestHandler } from './$types';
import fs from "fs"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const path = "songs/"

async function remove(path: string){
    if (await fs.existsSync(path)){
        await fs.unlinkSync(path)
    }
}

export const GET: RequestHandler = async ({cookies, params}) => {
    const token = cookies.get("token")
    if (token){
        console.log("Token =", token)
        let user = await prisma.user.findUnique({where:{token}, include:{playlists:true}})

        if (user){
            const song = await prisma.song.findFirst({where:{id:parseInt( params.song_id )}, include:{users:true}})
            if (song){
                let userFound = false
                song.users.forEach(songUser => {
                    if (songUser.id == user.id){
                        userFound = true
                    }
                })
                if (userFound || user.isAdmin){
                    await prisma.song.delete({where:{id:parseInt( params.song_id )}})
                    const path1 = `${path}${params.song_id}.png`
                    const path2 = `${path}${params.song_id}.mp3`
                    await remove(path1)
                    await remove(path2)
                }
            }
        }
    }
    return new Response();
};
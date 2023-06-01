import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({cookies, params}) => {
    const token = cookies.get("token")
    if (token){
        const user = await prisma.user.findUnique({where:{token}, include:{playlists:true}})

        if (user){
            const playlist = await prisma.playlist.findFirst({where:{id:parseInt( params.playlist_id )}, include:{users:{ select:{name:true, id:true} }}})
            if (playlist){
                let found = false
                playlist.users.forEach(puser => {
                    if (puser.id == user.id) {
                        found = true
                        return
                    }
                })
                if (found){
                    await prisma.playlist.delete({where:{id:playlist.id}})
                }
            }
        }
    }
    return new Response();
};
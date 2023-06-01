import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({params}) => {
    const song_id = parseInt(params.song_id)
    const playlist = await prisma.playlist.findFirst({where:{id:parseInt( params.playlist_id )}, include:{songs:true}})
    if (playlist){
        let found = false
        playlist.songs.forEach(song => {
            if (song.id == song_id) {
                found = true
                return
            }
        })
        if (!found){
            await prisma.playlist.update({where:{id:playlist.id}, data:{songs:{connect:{id:song_id}}}})
        }
    }
    return new Response();
};
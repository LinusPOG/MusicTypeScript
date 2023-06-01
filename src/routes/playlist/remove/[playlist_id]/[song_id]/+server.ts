import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({params}) => {
    const song_id = parseInt(params.song_id)
    await prisma.playlist.update({where:{id:parseInt( params.playlist_id )}, data:{songs:{disconnect:{id:song_id}}}})
    return new Response();
};
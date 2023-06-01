import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({params}) => {
    const topSongs = await prisma.song.findMany({
        take: 10,
        include:{users: true},
        where:{name:{contains: params.name}},
    })
    
    //return {songs: topSongs};
    if (topSongs){
        return new Response(JSON.stringify(topSongs));
    }
    return new Response("[]");
};
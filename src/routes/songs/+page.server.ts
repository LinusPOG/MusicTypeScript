import type { PageServerLoad } from './$types';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const load = (async () => {
    const topSongs = await prisma.song.findMany({take: 100, include:{users: {select:{name:true, id:true}}}})
    // const list = []
    // topSongs.forEach((song, index) => {
        
    // });
    return {songs: topSongs};
}) satisfies PageServerLoad;
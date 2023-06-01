import type { PageServerLoad } from './$types';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const load = (async ({params}) => {
    const playlist = prisma.playlist.findFirst({where:{id:parseInt( params.playlist_id )}, include:{users:{ select:{name:true, id:true} }, songs:{include:{users:{ select:{name:true, id:true} }}}}})
    return {playlist};
}) satisfies PageServerLoad;
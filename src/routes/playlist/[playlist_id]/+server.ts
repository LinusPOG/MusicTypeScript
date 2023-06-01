import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({params, url}) => {
    let include = null
    const fullData = url.searchParams.get("full")
    if(fullData){
        include = {users:{ select:{name:true, id:true} }, songs:{include:{users:{ select:{name:true, id:true} }}}}
    }
    const playlist = await prisma.playlist.findFirst({where:{id:parseInt( params.playlist_id )}, include})
    if (playlist){
        return new Response(JSON.stringify(playlist))
    }
    return new Response("{}")
};
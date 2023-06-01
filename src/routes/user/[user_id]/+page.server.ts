import type { PageServerLoad } from './$types';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const load = (async ({cookies}) => {
    const token = cookies.get("token")
    if (token){
        const user = await prisma.user.findUnique({where:{token}, select:{id:true,name:true,isAdmin:true,playlists:true,songs:true}})

        if (user){
            return {user}
        }
    }
    return {};
}) satisfies PageServerLoad;
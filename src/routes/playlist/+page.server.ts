import type { PageServerLoad, Actions, Action } from './$types';
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()
const savePath = "playlistImages/"

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

const create: Action = async ({ cookies, request }) => {
    const token = cookies.get("token")
    if (token){
        console.log("Token =", token)
        let user = await prisma.user.findUnique({where:{token}, include:{playlists:true}})

        if (user){
            const data = await request.formData()
            const [name, desc, imageData] = [data.get("name"), data.get("desc"), data.get("image")]
            //console.log(data)
            if (name != undefined && typeof(name) == "string" && desc != undefined && typeof(desc) == "string" && imageData) {
                const imageBlob: any = imageData?.valueOf()
                console.log("Saving..")
                const playlist = await prisma.playlist.create({data:{name, description: desc}})
                const tempUser = await prisma.user.update({where:{id:user.id}, data:{playlists:{connect:{id:playlist.id}}}, include:{playlists:true}})
                if (imageBlob.size > 0 && imageBlob.type == "image/png"){
                    const buffer = Buffer.from( await imageBlob.arrayBuffer() )
                    const path = savePath + `${playlist.id}.png`
                    console.log("Image!")
                    await fs.writeFileSync(path, buffer)
                }
                if (tempUser){ user = tempUser }
            } else {
                console.log("No data!", name, desc, imageData)
            }
            
            return {list: user.playlists}
        }
    }
}

export const actions: Actions = { create }
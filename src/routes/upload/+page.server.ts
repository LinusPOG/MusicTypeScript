import type { PageServerLoad, Actions, Action } from './$types';
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const savePath = 'songs/'
const prisma = new PrismaClient()

const fileEnd = "mp3", fileEnd2 = "png"
const allowedTypes = [
    "audio/mpeg",
]
const allowedTypes2 = [
    "image/png",
]

//prisma.playlist.update({where:{id:4},data:{songs:{connect:{id:123}}}})
//prisma.playlist.update({where:{id:4},data:{songs:{disconnect:{id:123}}}})
//prisma.playlist.findFirst({where:{id:4}}).songs()

const upload: Action = async ({ cookies, request }) => {
    const token = cookies.get("token")
    if (token){
        console.log("Token =", token)
        const user = await prisma.user.findUnique({where:{token}})

        if (user){
            const data = await request.formData()
            const [name, desc, blobData, imageData] = [data.get("name"), data.get("desc"), data.get("audio"), data.get("image")]
            if (name && desc != undefined && typeof(desc) == "string" && blobData && imageData){
                const song = await prisma.song.create({data:{
                    name: name.toString(),
                    description: desc.toString(),
                    users:{ connect:{id:user.id}} }
                })
                if (song){
                    const blob: any = blobData?.valueOf()
                    const imageBlob: any = imageData?.valueOf()
                    if (blob && typeof(blob) == "object" && blob.size > 0 && imageBlob && typeof(imageBlob) == "object") {
                        const type: string = blob.type
                        const fileName = song.id.toString()
                        if (allowedTypes.indexOf(type) > -1) {
                            const buffer = Buffer.from( await blob.arrayBuffer()  )
                            const path = savePath + `${fileName}.${fileEnd}`
                            
                            console.log("Saving..")
                            await fs.writeFileSync(path, buffer)
                        }
                        if (imageBlob.size > 0 && allowedTypes2.indexOf(imageBlob.type) > -1){
                            const path2 = savePath + `${fileName}.${fileEnd2}`
                            const buffer2 = Buffer.from( await imageBlob.arrayBuffer() )
                            console.log("Saving image..")
                            await fs.writeFileSync(path2, buffer2)
                        }
                    }
                } else {
                    console.log("Song was not added in db")
                }
            } else {
                console.log(name, desc, blobData)
            }
        } else {
            console.log("Not logged in..")
        }
    } else {
        console.log("No token..")
    }
    
    //console.log(await request.body?.getReader())

    //await fs.writeFileSync("./songs/" + "test.wav", file)
    
}

export const actions: Actions = { upload }
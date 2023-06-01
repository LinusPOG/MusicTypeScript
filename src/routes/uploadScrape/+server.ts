import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client'
import fs from "fs"
const prisma = new PrismaClient()

const path = "scraped/"
export const GET: RequestHandler = async () => {
    const songFiles = await fs.readdirSync(path)
    await songFiles.forEach(async fileName => {
        const songFind = await prisma.song.findFirst({where: {name:fileName}})
        if (songFind == undefined){
            const song = await prisma.song.create({data:{name:fileName, description:""}})
            fs.copyFileSync(path + fileName, "songs/" + song.id + ".mp3")
            console.log("Uploaded", fileName)
        }
    })
    return new Response("ok");
};
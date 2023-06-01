import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const POST: RequestHandler = async ({cookies, request}) => {
    try {
        const token = cookies.get("token")
        if (token){
            const user = await prisma.user.findUnique({where:{token}})

            if (user){
                const data: {
                    songList: {id: number}[],
                    playlistID: number,
                } = await request.json()
                if (data.songList){
                    const saveData: any = {
                        playlistID: data.playlistID,
                    }
                    const songList: Array<number> = []
                    data.songList.forEach(song => {
                        songList.push(song.id)
                    })
                    saveData.songList = songList
                    await prisma.user.update({
                        where:{id:user.id},
                        data:{state:JSON.stringify(saveData)},
                    })
                    console.log("SAVED STATE")
                } else {
                    console.log("NOT ENOUGH SAVE DATA..")
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
    return new Response();
};

export const GET: RequestHandler = async ({cookies}) => {
    try {
        const token = cookies.get("token")
        if (token){
            const user = await prisma.user.findUnique({where:{token}})

            if (user && user.state){
                const data = JSON.parse(user.state)
                const sendData: any = {
                    songList: [],
                    playlistID: data.playlistID != undefined?data.playlistID:-1,
                }
                const songs = await prisma.song.findMany({where:{id:{in:data.songList}}, include:{users:{select:{id:true, name:true}}}})
                songs.forEach(song => {
                    let index = 0
                    for (let i = 0; i<data.songList.length; i++){
                        const songid = data.songList[i]
                        if (songid == song.id){
                            index = i
                            break
                        }
                    }
                    sendData.songList[index] = song
                })
                //console.log(sendData)
                return new Response( JSON.stringify(sendData) )
            }
        }
    } catch (error) {
        console.log(error)
    }
    return new Response();
};
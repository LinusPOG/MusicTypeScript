import { v4 as uuidv4 } from 'uuid';
import { Prisma, PrismaClient, type Playlist, type Song } from '@prisma/client'
const prisma = new PrismaClient()

const ADMIN_NAME = "ADMIN"
let admin = await prisma.user.findFirst({where:{name:ADMIN_NAME}})
if (admin == undefined) {
    admin = await prisma.user.create({data:{name:ADMIN_NAME, password:"TEMP", isAdmin:true, email:"g@a.y", token:uuidv4()}})
}

const Playlists = [
    {
        name: "TOP G 10",
        update: async function(){
            return await prisma.song.findMany({take:10,orderBy:{plays:'desc'}})
        }
    }
]

const Functions = {
    update: async function(){
        const return_playlists: Playlist[] = []
        if (admin != null){
            for (let i=0; i<Playlists.length; i++) {
                const playlistData = Playlists[i]
                const SongList: any = await playlistData.update();
                //console.log(SongList)
                SongList.forEach((song: Song, index: number) => {
                    SongList[index] = { id: song.id };
                });
                //console.log(SongList)
                let playlist_id = await prisma.scriptedPlaylist.findFirst({ where: { name: playlistData.name } });
                let playlist;
                if (playlist_id) {
                    playlist = await prisma.playlist.findFirst({ where: { id: playlist_id.id } });
                } else {
                    playlist = await prisma.playlist.create({ data: { name: playlistData.name, description: "" } });
                    playlist_id = await prisma.scriptedPlaylist.create({ data: { id: playlist.id, name: playlistData.name } });
                }

                if (playlist) {
                    playlist = await prisma.playlist.update(
                        {
                            where: { id: playlist_id.id },
                            data: {
                                songs: {
                                    set: SongList,
                                }
                            },
                            include: { songs: true },
                        }
                    );
                    //console.log(playlist)
                    return_playlists.push(playlist);
                } else {
                    console.log("PLAYLIST WAS NOT FOUND..", playlistData);
                    await prisma.scriptedPlaylist.delete({ where: { name: playlistData.name } });
                }
            }
        } else {
            console.log("ADMIN == NULL")
        }
        console.log(return_playlists)
        return return_playlists
    }
}

export default Functions
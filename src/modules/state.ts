const songList: {
    id: number,
    name: string,
    description: string,
    users: Array<any>,
}[] = []

const Data = {
    userID: -1,
    isAdmin: false,
    songChanged: false,
    songList,
    isPlaying: false,
    playlistAdd: false,
    playlistAddID: 0,
    playlistID: -1,
}

export default Data
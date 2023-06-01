import type { RequestHandler } from './$types';
import fs from 'fs'

export const GET: RequestHandler = async ({ params }) => {
    const path = `playlistImages/${params.playlist_id}.png`
    let img
    if (await fs.existsSync(path)) {
        img = await fs.readFileSync(path)
    } else {
        img = await fs.readFileSync("notfound.jpg")
    }
    return new Response(img);
};
import type { RequestHandler } from './$types';
import Recommend from '../../modules/recommend'

export const GET: RequestHandler = async () => {
    return new Response(JSON.stringify(await Recommend.update()));
};
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({cookies}) => {
    cookies.delete("token")
    throw redirect(302, "/songs")
}) satisfies PageServerLoad;
import { env } from 'cloudflare:workers';

export default {
	async fetch(request, _, ctx) {
		const url = new URL(request.url);
		const subreddit = url.searchParams.get('subreddit');
		const category = url.searchParams.get('category') || 'hot';
		const limit = url.searchParams.get('limit') || 5;

		if (!subreddit) {
			return Response.json({ error: `No Subreddit Provided` }, { status: 404 });
		}

		const redditApiUrl = `https://www.reddit.com/r/${subreddit}/${category}.json?raw_json=1&limit=${limit}`;
		const headers = new Headers({
			'User-Agent': env.USER_AGENT,
			Accept: 'application/json',
		});

		try {
			const response = await fetch(redditApiUrl, {
				headers,
				method: 'GET',
			});

			console.log(response.body, response.status, response.statusText);
			if (!response.ok) {
				return Response.json({ error: `Reddit API returned ${response.status}: ${response.statusText}` }, { status: response.status });
			}

			const data = await response.json();

			return Response.json(data, {
				headers: {
					'Access-Control-Allow-Origin': env.BACKEND_URL,
					'Cache-Control': 's-maxage=60',
				},
			});
		} catch (error: any) {
			return Response.json({ error: `Internal Server Error`, message: error.message }, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;

export default {
	async fetch(request, env, ctx) {
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
			console.log('[info] Sending Request To', { subreddit, category, limit });

			const response = await fetch(redditApiUrl, {
				headers,
				method: 'GET',
			});

			if (!response.ok) {
				return Response.json({ error: `Reddit API returned ${response.status}: ${response.statusText}` }, { status: response.status });
			}

			const data = await response.json();

			console.log('[success] Succeeded');
			return Response.json(data, {
				headers: {
					'Access-Control-Allow-Origin': env.BACKEND_URL,
					'Cache-Control': 's-maxage=60',
				},
			});
		} catch (error: any) {
			console.error('[error]', error);
			return Response.json({ error: `Internal Server Error`, message: error.message }, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;

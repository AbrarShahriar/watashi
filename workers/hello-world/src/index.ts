export default {
	async fetch(request, env, ctx) {
		return Response.json({ message: `Hello World ${env.MESSAGE}` }, { status: 200 });
	},
} satisfies ExportedHandler<Env>;

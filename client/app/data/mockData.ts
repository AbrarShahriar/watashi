import { FeedData } from "../types/feed";

export const mockFeedData: FeedData = {
  emails: [
    {
      id: "19b2c08d1a256bdc",
      subject: "📷 OpenAI answers Google with major image upgrade",
      from: "news@daily.therundown.ai",
      historyId: "9779",
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      posts: [
        {
          title: "OpenAI counters Nano Banana Pro with new Images upgrade",
          link: "https://therundown.ai/openai-image-upgrade",
          desc: "OpenAI just released GPT Image 1.5, a major update to ChatGPT's image generator that creates visuals up to 4x faster, improves text rendering, and maintains consistency across edits — arriving as an answer to Google's recent creative momentum with Nano Banana Pro.",
        },
        {
          title: "HubSpot CEO Dharmesh Shah on SEO for the AI era",
          link: "https://therundown.ai/hubspot-seo",
          desc: "We sat down with HubSpot CEO Dharmesh Shah for an exclusive interview on how the traditional SEO playbook is changing with LLMs and how to prepare for a world run by agents.",
        },
      ],
    },
    {
      id: "19b2c08d1a256bdd",
      subject: "🚀 Weekly AI Roundup: What you missed",
      from: "newsletter@tldr.tech",
      historyId: "9780",
      receivedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
      posts: [
        {
          title: "Anthropic releases Claude 4 with reasoning improvements",
          link: "https://tldr.tech/anthropic-claude-4",
          desc: "Anthropic announced Claude 4 with significant improvements in multi-step reasoning, code generation, and reduced hallucinations. The new model shows 40% better performance on complex tasks.",
        },
        {
          title: "Meta open-sources new vision model",
          link: "https://tldr.tech/meta-vision",
          desc: "Meta has released SAM 2, an advanced segmentation model that can identify and track objects in videos with unprecedented accuracy.",
        },
      ],
    },
    {
      id: "19b2c08d1a256bde",
      subject: "The Morning Brew ☕",
      from: "crew@morningbrew.com",
      historyId: "9781",
      receivedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
      posts: [
        {
          title: "Tech stocks rally as Fed signals rate pause",
          link: "https://morningbrew.com/tech-rally",
          desc: "Markets responded positively to the Federal Reserve's latest meeting minutes, with tech giants leading the charge. NVIDIA, Apple, and Microsoft all posted significant gains.",
        },
      ],
    },
  ],
  external: {
    xPostsResults: [
      {
        title:
          "Just shipped: AI-powered code review is now available to all GitHub users",
        description:
          "We're excited to announce that Copilot code review is now available to everyone. Get instant feedback on your pull requests.",
        source: "X",
        author: "@github",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        url: "https://x.com/github/status/123456789",
        performance: {
          likes: 4521,
          retweets: 892,
        },
      },
      {
        title:
          "The future of web development is here. Check out our new framework.",
        description:
          "Introducing a revolutionary approach to building web applications. Zero config, maximum performance.",
        source: "X",
        author: "@vercel",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        url: "https://x.com/vercel/status/987654321",
        performance: {
          likes: 2103,
          retweets: 445,
        },
      },
    ],
    hnResults: [
      {
        title: "Calendar",
        description:
          "A minimalist calendar app built with vanilla JavaScript and CSS.",
        source: "HN - Front Page",
        author: "twapi",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        url: "https://neatnik.net/calendar/?year=2026",
        performance: {
          numOfComments: 112,
          points: 918,
        },
      },
      {
        title: "Replacing JavaScript with Just HTML",
        description:
          "An exploration of modern HTML capabilities that can replace common JavaScript patterns.",
        source: "HN - Front Page",
        author: "soheilpro",
        createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        url: "https://www.htmhell.dev/adventcalendar/2025/27/",
        performance: {
          numOfComments: 250,
          points: 666,
        },
      },
      {
        title: "Why SQLite is the future of embedded databases",
        description:
          "A deep dive into SQLite's architecture and why it's becoming the default choice.",
        source: "HN - Front Page",
        author: "sqlite_fan",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        url: "https://example.com/sqlite-future",
        performance: {
          numOfComments: 89,
          points: 445,
        },
      },
      {
        title: "Building a Programming Language from Scratch",
        description:
          "Tutorial series on creating your own programming language with LLVM.",
        source: "HN - Front Page",
        author: "compiler_dev",
        createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        url: "https://example.com/build-lang",
        performance: {
          numOfComments: 156,
          points: 523,
        },
      },
    ],
    subredditResults: [
      {
        title: 'Monthly "Is there a tool for..." Post',
        description:
          "If you have a use case that you want to use AI for, but don't know which tool to use, this is where you can ask the community to help out.",
        source: "ArtificialInteligence",
        author: "t2_6l4z3",
        createdAt: Date.now() - 6 * 60 * 60 * 1000,
        url: "https://www.reddit.com/r/ArtificialInteligence/comments/monthly-tools",
        performance: {
          ups: 892,
          downs: 23,
          score: 869,
        },
      },
      {
        title: "I built an AI agent that manages my entire smart home",
        description:
          "After 6 months of development, I finally have an AI that controls lights, thermostat, security, and even orders groceries when supplies run low.",
        source: "MachineLearning",
        author: "smart_home_dev",
        createdAt: Date.now() - 10 * 60 * 60 * 1000,
        url: "https://www.reddit.com/r/MachineLearning/comments/ai-smart-home",
        performance: {
          ups: 2341,
          downs: 45,
          score: 2296,
        },
      },
      {
        title: "The state of local LLMs in 2025",
        description:
          "A comprehensive comparison of running LLMs locally: Llama 3, Mistral, Phi-3, and more. Benchmarks included.",
        source: "LocalLLaMA",
        author: "local_llm_enthusiast",
        createdAt: Date.now() - 14 * 60 * 60 * 1000,
        url: "https://www.reddit.com/r/LocalLLaMA/comments/state-of-local-llms",
        performance: {
          ups: 1567,
          downs: 34,
          score: 1533,
        },
      },
    ],
  },
};

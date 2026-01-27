export type RedditRaw = {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  author_fullname: string;
  created_utc: number;
  url: string;
  ups: number;
  downs: number;
  score: number;
  num_comments: number;
  stickied: boolean;
  is_gallery?: boolean;
  media_metadata?: {
    [key: string]: {
      s: {
        y: number;
        x: number;
        u: string;
      };
    };
  };
  preview?: {
    images: {
      source: {
        url: string;
        width: number;
        height: number;
        resolutions: {
          url: string;
          width: number;
          height: number;
        }[];
      };
    }[];
  };
};

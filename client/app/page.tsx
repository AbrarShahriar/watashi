import Feed from "../components/feed/Feed";

export const revalidate = 3600;
export const fetchCache = "force-cache";
export const preferredRegion = "auto";

export default function Home() {
  return <Feed />;
}

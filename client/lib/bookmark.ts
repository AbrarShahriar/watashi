import { Post } from "./types";

type Listener = () => void;

export class Bookmark {
  private static readonly BOOKMARKS_KEY = "feed-bookmarks";
  private static bookmarks: Post[] | null = null;
  private static listeners: Listener[] = [];
  private static SSRDefault: Post[] = [];

  public static subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static emitChange() {
    this.listeners.forEach((listener) => listener());
  }

  public static getBookmarks(): Post[] {
    if (typeof window === "undefined") return [];

    if (this.bookmarks !== null) {
      return this.bookmarks;
    }
    try {
      const stored = localStorage.getItem(this.BOOKMARKS_KEY);
      // const parsed = JSON.parse(stored) as Post[];
      this.bookmarks = stored ? (JSON.parse(stored) as Post[]) : [];
      // this.bookmarks.splice(0, this.bookmarks.length);
      // this.bookmarks.push(...parsed);
    } catch (error) {
      this.bookmarks = [];
    }

    return this.bookmarks;
  }

  public static setBookmarks(posts: Post[]): void {
    this.bookmarks = posts;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(this.bookmarks));
    }
    this.emitChange();
  }

  public static toggleBookmark(post: Post): void {
    const prev = this.getBookmarks();
    if (this.isBookmarked(post)) {
      const newBookmarks = prev.filter((item) => item.id != post.id);
      this.setBookmarks(newBookmarks);
    } else {
      const newBookmarks = [...prev, post];
      this.setBookmarks(newBookmarks);
    }
  }

  public static isBookmarked(post: Post): boolean {
    return this.getBookmarks().some((item) => item.id == post.id);
  }

  public static clearBookmarks(): void {
    this.setBookmarks([]);
  }

  public static size(): number {
    try {
      return this.getBookmarks().length;
    } catch (error) {
      return 0;
    }
  }

  public static getSSRDefault() {
    return this.SSRDefault;
  }
}

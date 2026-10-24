
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Grid3X3,
  Settings,
  Camera,
  LoaderCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
};

type Post = {
  _id: string;
  username: string;
  location: string;
  initial: string;
  likes: number;
  caption: string;
  media: {
    url: string;
    type: "image" | "video";
  }[];
  createdAt?: string;
};

type FollowStats = {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followStats, setFollowStats] =
    useState<FollowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        // Get the currently logged-in user.
        const userResponse = await fetch(
          `${API_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        if (userResponse.status === 401) {
          router.replace("/login");
          return;
        }

        if (!userResponse.ok) {
          throw new Error("Unable to load your profile.");
        }

        const userData = await userResponse.json();
        const currentUser: User = userData.user ?? userData;

        if (cancelled) return;

        setUser(currentUser);

        // Load real follower and following counts.
        const statsResponse = await fetch(
          `${API_URL}/api/users/${currentUser.id}/follow-status`,
          {
            credentials: "include",
          }
        );

        if (!statsResponse.ok) {
          throw new Error(
            "Unable to load follower statistics."
          );
        }

        const statsData: FollowStats =
          await statsResponse.json();

        if (cancelled) return;

        setFollowStats(statsData);

        // Fetch only posts owned by the logged-in user.
        const postsResponse = await fetch(
          `${API_URL}/api/posts/mine`,
          {
            credentials: "include",
          }
        );

        if (postsResponse.status === 401) {
          router.replace("/login");
          return;
        }

        if (!postsResponse.ok) {
          throw new Error("Unable to load your posts.");
        }

        const myPosts: Post[] =
          await postsResponse.json();

        if (cancelled) return;

        setPosts(myPosts);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <LoaderCircle
          className="animate-spin"
          size={32}
        />
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-white text-black">
        <section className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 md:ml-64">
          <p>{error || "Profile not available."}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-black px-5 py-2 text-white"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="min-h-screen pb-20 md:ml-64">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-10">
          {/* Profile header */}
          <header className="flex flex-col gap-8 border-b border-gray-200 pb-10 sm:flex-row sm:items-center sm:gap-16 sm:px-8">
            <div className="flex shrink-0 justify-center sm:w-52">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.username}'s profile`}
                  className="h-32 w-32 rounded-full object-cover sm:h-36 sm:w-36"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-5xl font-semibold text-white sm:h-36 sm:w-36">
                  {(
                    user.username ||
                    user.email ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-6 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <h1 className="text-xl font-normal">
                  {user.username}
                </h1>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/profile/edit")
                  }
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold hover:bg-gray-200"
                >
                  Edit profile
                </button>

                <button
                  type="button"
                  aria-label="Profile settings"
                  onClick={() => router.push("/settings")}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <Settings size={22} />
                </button>
              </div>

              {/* Live profile statistics */}
              <div className="mb-6 flex justify-center gap-6 text-sm sm:justify-start sm:gap-8">
                <p>
                  <strong>{posts.length}</strong>{" "}
                  <span>posts</span>
                </p>

                <p>
                  <strong>
                    {followStats?.followersCount ?? 0}
                  </strong>{" "}
                  <span>followers</span>
                </p>

                <p>
                  <strong>
                    {followStats?.followingCount ?? 0}
                  </strong>{" "}
                  <span>following</span>
                </p>
              </div>

              <div className="text-center sm:text-left">
                <p className="font-semibold">
                  {user.username}
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {user.bio || "No bio yet."}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
          </header>

          {/* Posts tab */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 border-t border-black py-4 text-xs font-semibold uppercase tracking-widest">
              <Grid3X3 size={14} />
              Posts
            </div>
          </div>

          {/* Posts grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-5">
              {posts.map((post) =>
                post.media.map((media, index) => (
                  <button
                    key={`${post._id}-${index}`}
                    type="button"
                    onClick={() =>
                      router.push(`/post/${post._id}`)
                    }
                    className="group relative aspect-square overflow-hidden bg-gray-100"
                    aria-label={`View post: ${post.caption}`}
                  >
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={post.caption || "Your post"}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <span className="font-semibold text-white">
                        ♥ {post.likes}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black">
                <Camera size={30} />
              </div>

              <h2 className="mb-2 text-3xl font-bold">
                Share Photos
              </h2>

              <p className="mb-5 text-sm text-gray-500">
                Your photos and videos will appear here.
              </p>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-sm font-semibold text-blue-600"
              >
                Explore posts
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

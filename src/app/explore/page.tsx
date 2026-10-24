"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Search, X } from "lucide-react";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`${API_URL}/api/posts`);

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data: Post[] = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching Explore posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const query = search.toLowerCase();

    return (
      post.username.toLowerCase().includes(query) ||
      post.caption.toLowerCase().includes(query) ||
      post.location.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-white text-black md:ml-64">
  

      <section className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <h1 className="mb-6 text-2xl font-bold">Explore</h1>

        <div className="mb-8 flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-3">
          <Search size={20} className="text-gray-500" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search posts, usernames, or locations..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {loading ? (
          <p className="py-12 text-center text-gray-500">
            Loading posts...
          </p>
        ) : filteredPosts.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            {search
              ? "No matching posts found."
              : "No posts available yet. Create your first post!"}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
            {filteredPosts.map((post) => {
              const firstMedia = post.media?.[0];

              return (
                <button
                  type="button"
                  key={post._id}
                  onClick={() => setSelectedPost(post)}
                  className="group relative aspect-square overflow-hidden bg-gray-100"
                  aria-label={`View post by ${post.username}`}
                >
                  {firstMedia?.type === "video" ? (
                    <video
                      src={firstMedia.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : firstMedia ? (
                    <img
                      src={firstMedia.url}
                      alt={`Post by ${post.username}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-3 text-sm text-gray-500">
                      No media
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <span className="flex items-center gap-1 font-semibold">
                      <Heart size={20} fill="white" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <MessageCircle size={20} />
                      View
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white md:flex-row"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow"
              aria-label="Close post"
            >
              <X size={20} />
            </button>

            <div className="relative flex min-h-64 items-center justify-center bg-black md:min-h-[500px] md:w-3/5">
              {selectedPost.media?.[0]?.type === "video" ? (
                <video
                  src={selectedPost.media[0].url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : selectedPost.media?.[0] ? (
                <img
                  src={selectedPost.media[0].url}
                  alt={`Post by ${selectedPost.username}`}
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : null}
            </div>

            <div className="overflow-y-auto p-5 md:w-2/5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold">
                  {selectedPost.initial}
                </div>

                <div>
                  <p className="font-semibold">{selectedPost.username}</p>
                  <p className="text-xs text-gray-500">
                    {selectedPost.location}
                  </p>
                </div>
              </div>

              <p className="whitespace-pre-wrap text-sm">
                {selectedPost.caption}
              </p>

              <div className="mt-5 flex items-center gap-2 border-t pt-4">
                <Heart size={20} />
                <span className="text-sm font-semibold">
                  {selectedPost.likes} likes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
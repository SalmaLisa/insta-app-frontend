"use client";

import {
  Home,
  Compass,
  Clapperboard,
  PlusSquare,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import EditPostModal from "@/components/EditPostModal";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Post = {
  _id: string;
  userId: string;
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

export default function HomePage() {
  const [dbPosts, setDbPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts.");
      }

      const data: Post[] = await response.json();
      setDbPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    function handlePostCreated(event: Event) {
      const post = (event as CustomEvent<Post>).detail;

      if (!post?._id) return;

      setDbPosts((previous) => [
        post,
        ...previous.filter((item) => item._id !== post._id),
      ]);
    }

    window.addEventListener("post-created", handlePostCreated);

    return () => {
      window.removeEventListener("post-created", handlePostCreated);
    };
  }, []);

  // Refresh posts when returning to the homepage.
  useEffect(() => {
    function handlePageShow() {
      if (document.visibilityState === "visible") {
        fetchPosts();
      }
    }

    document.addEventListener("visibilitychange", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handlePageShow);
    };
  }, [fetchPosts]);

  async function handleDelete(postId: string) {
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to delete post.");
      }

      setDbPosts((previous) =>
        previous.filter((post) => post._id !== postId)
      );
    } catch (error) {
      console.error("Delete post error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Could not delete the post."
      );
    }
  }

  async function handleSaveEdit(
    postId: string,
    caption: string,
    location: string
  ) {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caption, location }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Failed to update post.");
    }

    const updatedPost = data.post ?? data;

    setDbPosts((previous) =>
      previous.map((post) =>
        post._id === postId ? { ...post, ...updatedPost } : post
      )
    );
  }

  function openCreatePost() {
    window.dispatchEvent(new Event("open-create-post"));
  }

  function handleEdit(post: Post) {
    setEditingPost(post);
  }

  return (
    <main className="min-h-screen bg-white pb-16 text-black md:pb-0">
      <section className="min-h-screen md:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-8 flex items-center justify-between md:hidden">
            <h1 className="text-2xl font-semibold">InstaApp</h1>
            <span className="text-2xl font-bold">◎</span>
          </header>

          <div className="mx-auto max-w-2xl">
            <h2 className="mb-5 text-lg font-semibold">Stories</h2>

            <div className="mb-10 flex gap-5 overflow-x-auto pb-3">
              {["Your story", "alex", "sophia", "michael", "emma"].map(
                (name, index) => (
                  <div
                    key={name}
                    className="flex min-w-16 flex-col items-center gap-2"
                  >
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full p-[3px] ${
                        index === 0
                          ? "border-2 border-gray-300"
                          : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                      }`}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-gray-100 text-lg font-semibold">
                        {index === 0
                          ? "+"
                          : name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <span className="max-w-16 truncate text-xs">
                      {name}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="space-y-10">
              {isLoadingPosts ? (
                <p className="py-8 text-center text-gray-500">
                  Loading posts...
                </p>
              ) : dbPosts.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  No posts yet. Create your first post!
                </p>
              ) : (
                dbPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    onCreateClick={openCreatePost}
                    onDelete={() => handleDelete(post._id)}
                    onEdit={() => handleEdit(post)}
                    username={post.username}
                    location={post.location}
                    initial={post.initial}
                    likes={post.likes}
                    caption={post.caption}
                    media={post.media}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 z-40 flex w-full justify-around border-t border-gray-200 bg-white px-2 py-3 md:hidden">
        <Link href="/" aria-label="Home">
          <Home size={24} />
        </Link>

        <Link href="/explore" aria-label="Explore">
          <Compass size={24} />
        </Link>

        <button
          type="button"
          onClick={openCreatePost}
          aria-label="Create post"
        >
          <PlusSquare size={24} />
        </button>

        <Link href="/reels" aria-label="Reels">
          <Clapperboard size={24} />
        </Link>

        <Link href="/profile" aria-label="Profile">
          <UserRound size={24} />
        </Link>
      </nav>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
        />
      )}
    </main>
  );
}
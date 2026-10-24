"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  PlusSquare,
  Send,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";

type MediaItem = {
  url: string;
  type: "image" | "video";
};

type PostCardProps = {
  onCreateClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  userId?: string;
  username: string;
  location: string;
  initial: string;
  likes: number;
  caption: string;
  imageUrl?: string;
  media?: MediaItem[];
};

export default function PostCard({
  onCreateClick,
  onDelete,
  onEdit,
  userId,
  username,
  location,
  initial,
  likes,
  caption,
  imageUrl,
  media = [],
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Support both database posts and posts with a single image.
  const postMedia: MediaItem[] =
    media.length > 0
      ? media
      : imageUrl
        ? [{ url: imageUrl, type: "image" }]
        : [];

  const activeMedia = postMedia[activeMediaIndex];

  function showPreviousMedia() {
    setActiveMediaIndex((current) =>
      current === 0 ? postMedia.length - 1 : current - 1
    );
  }

  function showNextMedia() {
    setActiveMediaIndex((current) =>
      current === postMedia.length - 1 ? 0 : current + 1
    );
  }

  const profileHref = userId ? `/profile/${userId}` : "/profile";

  return (
    <article className="max-w-[470px] border-b border-gray-200 pb-6">
      {/* Post header */}
      <div className="mb-3 flex items-center gap-3">
        <Link
          href={profileHref}
          aria-label={`View ${username}'s profile`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-[2px]"
        >
          <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-gray-100 font-semibold">
            {initial}
          </span>
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="block truncate text-sm font-semibold hover:opacity-70"
          >
            {username}
          </Link>

          <p className="truncate text-xs text-gray-500">
            {location}
          </p>
        </div>

        {/* Post options */}
        {onDelete && (
          <div className="relative flex shrink-0 justify-end">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsMenuOpen((previous) => !previous);
              }}
              aria-label="Post options"
              aria-expanded={isMenuOpen}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <MoreHorizontal size={22} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-10 z-10 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onEdit();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Pencil size={16} />
                    Edit post
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <Trash2 size={16} />
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post media */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm bg-gray-100">
        {activeMedia &&
          (activeMedia.type === "video" ? (
            <video
              key={activeMedia.url}
              src={activeMedia.url}
              controls
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              key={activeMedia.url}
              src={activeMedia.url}
              alt={`Post by ${username}`}
              className="h-full w-full object-cover"
            />
          ))}

        {postMedia.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousMedia}
              aria-label="Previous media"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={showNextMedia}
              aria-label="Next media"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
            >
              <ChevronRight size={24} />
            </button>

            <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
              {activeMediaIndex + 1}/{postMedia.length}
            </span>
          </>
        )}
      </div>

      {/* Post actions */}
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          aria-label={liked ? "Unlike post" : "Like post"}
          aria-pressed={liked}
          onClick={() => setLiked((previous) => !previous)}
          className="transition hover:scale-110"
        >
          <Heart
            size={25}
            className={liked ? "fill-red-500 text-red-500" : ""}
          />
        </button>

        <button
          type="button"
          aria-label="Focus comment input"
          onClick={() => {
            document
              .getElementById(`comment-input-${userId ?? username}`)
              ?.focus();
          }}
        >
          <MessageCircle size={25} />
        </button>

        <button
          type="button"
          aria-label="Create post"
          onClick={() => {
            if (onCreateClick) {
              onCreateClick();
            } else {
              window.dispatchEvent(new Event("open-create-post"));
            }
          }}
        >
          <PlusSquare size={25} />
        </button>
      </div>

      {/* Likes and caption */}
      <p className="mt-3 text-sm font-semibold">
        {likes + (liked ? 1 : 0)} likes
      </p>

      <p className="mt-1 text-sm">
        <Link
          href={profileHref}
          className="font-semibold hover:opacity-70"
        >
          {username}
        </Link>{" "}
        {caption}
      </p>

      {/* Comments */}
      <div className="mt-2 space-y-2">
        {comments.map((comment, index) => (
          <p key={`${index}-${comment}`} className="text-sm">
            <span className="font-semibold">{username}</span>{" "}
            {comment}
          </p>
        ))}

        <form
          className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3"
          onSubmit={(event) => {
            event.preventDefault();

            const trimmedComment = commentInput.trim();
            if (!trimmedComment) return;

            setComments((previous) => [
              ...previous,
              trimmedComment,
            ]);

            setCommentInput("");
          }}
        >
          <input
            id={`comment-input-${userId ?? username}`}
            type="text"
            value={commentInput}
            onChange={(event) =>
              setCommentInput(event.target.value)
            }
            placeholder="Add a comment..."
            aria-label="Write a comment"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />

          <button
            type="submit"
            disabled={!commentInput.trim()}
            className="text-sm font-semibold text-blue-600 disabled:opacity-40"
            aria-label="Post comment"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </article>
  );
}

"use client";

import { useState } from "react";

type EditPostModalProps = {
  post: {
    _id: string;
    caption: string;
    location: string;
  };
  onClose: () => void;
  onSave: (postId: string, caption: string, location: string) => Promise<void>;
};

export default function EditPostModal({
  post,
  onClose,
  onSave,
}: EditPostModalProps) {
  const [caption, setCaption] = useState(post.caption || "");
  const [location, setLocation] = useState(post.location || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      await onSave(post._id, caption, location);
      onClose();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to update post."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 text-black shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit post</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black"
            aria-label="Close edit form"
          >
            ×
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Caption</label>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={4}
            maxLength={2200}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
            placeholder="Write a caption..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={150}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
            placeholder="Add location"
          />
        </div>

        <p className="text-xs text-gray-500">
          Your existing photos and videos will remain unchanged.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

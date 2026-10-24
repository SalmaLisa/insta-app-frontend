
"use client";

import { useEffect, useState } from "react";
import { X, ImagePlus, Plus } from "lucide-react";

type CreatePostModalProps = {
  onClose: () => void;
  onShare: (files: File[], caption: string) => Promise<void>;
};

const MAX_FILES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_DURATION = 180;

export default function CreatePostModal({
  onClose,
  onShare,
}: CreatePostModalProps) {
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<
    { file: File; url: string }[]
  >([]);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url)
      );
    };
  }, [files]);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const remainingSlots = MAX_FILES - files.length;

    if (selectedFiles.length > remainingSlots) {
      alert(`You can add only ${remainingSlots} more file(s).`);
      return;
    }

    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        alert(`${file.name}: Please select an image or video.`);
        continue;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        alert(`${file.name}: Images must be 10 MB or smaller.`);
        continue;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        alert(`${file.name}: Videos must be 50 MB or smaller.`);
        continue;
      }

      if (isVideo) {
        const duration = await getVideoDuration(file);

        if (duration > MAX_VIDEO_DURATION) {
          alert(`${file.name}: Videos must be 3 minutes or shorter.`);
          continue;
        }
      }

      validFiles.push(file);
    }

    setFiles((previous) =>
      [...previous, ...validFiles].slice(0, MAX_FILES)
    );
  }

  function removeFile(index: number) {
    setFiles((previous) => previous.filter((_, i) => i !== index));
  }

  async function handleShare() {
    if (files.length === 0 || isSharing) return;

    try {
      setIsSharing(true);
      await onShare(files, caption.trim());
    } catch (error) {
      console.error("Failed to share post:", error);
      alert("Could not share your post. Please try again.");
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Create new post</h2>

          <button
            type="button"
            onClick={onClose}
            disabled={isSharing}
            aria-label="Close modal"
            className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map((preview, index) => (
              <div
                key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-100"
              >
                {preview.file.type.startsWith("video/") ? (
                  <video
                    src={preview.url}
                    controls
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <img
                    src={preview.url}
                    alt={`Selected media ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={isSharing}
                  aria-label={`Remove ${preview.file.name}`}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {files.length < MAX_FILES && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-3 hover:bg-gray-50">
                {files.length === 0 ? (
                  <ImagePlus size={36} className="text-gray-500" />
                ) : (
                  <Plus size={30} className="text-gray-500" />
                )}

                <span className="text-center text-sm text-gray-600">
                  {files.length === 0 ? "Select photos/videos" : "Add more"}
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                  multiple
                  onChange={handleFileChange}
                  disabled={isSharing}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Up to 5 photos or videos. Images: 10 MB max each. Videos: 50 MB
            max each and 3 minutes maximum.
          </p>

          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Write a caption..."
            rows={4}
            disabled={isSharing}
            maxLength={2200}
            className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
          />

          <button
            type="button"
            disabled={files.length === 0 || isSharing}
            onClick={handleShare}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSharing ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      video.remove();
      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      video.remove();
      resolve(Infinity);
    };

    video.src = url;
  });
}

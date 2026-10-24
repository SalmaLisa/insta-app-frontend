
"use client";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Save,
  Camera,
  UserRound,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  username: string;
  bio?: string;
  profilePicture?: string;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
const [selectedImage, setSelectedImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState("");
const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile.");
        }

        const user: User = data.user ?? data;

        setUsername(user.username || "");
        setBio(user.bio || "");
        setProfilePicture(user.profilePicture || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);
const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("Please select a valid image.");
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("Image must be 5 MB or smaller.");
    event.target.value = "";
    return;
  }

  setError("");
  setSelectedImage(file);

  const previewUrl = URL.createObjectURL(file);
  setImagePreview((previous) => {
    if (previous) URL.revokeObjectURL(previous);
    return previewUrl;
  });
};
const handleImageUpload = async () => {
  if (!selectedImage) {
    setError("Please select an image first.");
    return;
  }

  setUploadingImage(true);
  setError("");
  setSuccess("");

  try {
    const formData = new FormData();
    formData.append("profilePicture", selectedImage);

    const response = await fetch(`${API_URL}/api/auth/profile-picture`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload profile picture.");
    }

    setProfilePicture(data.user.profilePicture || "");
    setSelectedImage(null);
    setImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return "";
    });

    setSuccess("Profile picture updated successfully.");
    router.refresh();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to upload profile picture."
    );
  } finally {
    setUploadingImage(false);
  }
};
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanUsername = username.trim();
    const cleanBio = bio.trim();

    if (!/^[a-zA-Z0-9._]{3,30}$/.test(cleanUsername)) {
      setError(
        "Username must be 3–30 characters and contain only letters, numbers, dots, or underscores."
      );
      return;
    }

    if (cleanBio.length > 150) {
      setError("Bio cannot exceed 150 characters.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          bio: cleanBio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setUsername(data.user.username);
      setBio(data.user.bio || "");
      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 text-white">
      <button
        type="button"
        onClick={() => router.push("/profile")}
        className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Back to profile
      </button>

      <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
        <p className="mt-2 text-sm text-gray-400">
          Update your username and tell people a little about yourself.
        </p>

<div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-white/10 p-6 sm:flex-row">
  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#252525]">
    {imagePreview || profilePicture ? (
      <img
        src={imagePreview || profilePicture}
        alt="Profile preview"
        className="h-full w-full object-cover"
      />
    ) : (
      <UserRound size={38} className="text-gray-400" />
    )}
  </div>

  <div className="flex-1 text-center sm:text-left">
    <h2 className="font-medium">Profile picture</h2>
    <p className="mt-1 text-sm text-gray-400">
      JPG, PNG, or another supported image format. Maximum 5 MB.
    </p>

    <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10">
        <Camera size={16} />
        Choose image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>

      {selectedImage && (
        <>
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={uploadingImage}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
          >
            {uploadingImage ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {uploadingImage ? "Uploading..." : "Upload picture"}
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedImage(null);
              setImagePreview((previous) => {
                if (previous) URL.revokeObjectURL(previous);
                return "";
              });
            }}
            className="rounded-lg p-2 text-gray-400 hover:text-white"
            aria-label="Cancel image selection"
          >
            <X size={18} />
          </button>
        </>
      )}
    </div>
  </div>
</div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength={3}
              maxLength={30}
              required
              autoComplete="username"
              className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 outline-none transition focus:border-white/40"
              placeholder="Enter your username"
            />

            <p className="mt-2 text-xs text-gray-500">
              Use 3–30 letters, numbers, dots, or underscores.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="bio"
                className="text-sm font-medium"
              >
                Bio
              </label>

              <span className="text-xs text-gray-500">
                {bio.length}/150
              </span>
            </div>

            <textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={150}
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 outline-none transition focus:border-white/40"
              placeholder="Write something about yourself..."
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

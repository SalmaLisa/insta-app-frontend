
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import CreatePostModal from "@/components/CreatePostModal";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const hideSidebar =
    pathname === "/login" || pathname === "/register";

  useEffect(() => {
    function handleOpenCreatePost() {
      setIsCreatePostOpen(true);
    }

    window.addEventListener(
      "open-create-post",
      handleOpenCreatePost
    );

    return () => {
      window.removeEventListener(
        "open-create-post",
        handleOpenCreatePost
      );
    };
  }, []);

  async function handleShare(files: File[], caption: string) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("media", file);
    });

    formData.append("username", "you");
    formData.append("location", "Your profile");
    formData.append("initial", "Y");
    formData.append("caption", caption);

    const response = await fetch(`${API_URL}/api/posts`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create post.");
    }

    setIsCreatePostOpen(false);

    window.dispatchEvent(
      new CustomEvent("post-created", {
        detail: data,
      })
    );
  }

  return (
    <>
      {!hideSidebar && (
        <Sidebar
          onCreateClick={() => setIsCreatePostOpen(true)}
        />
      )}

      <main className={hideSidebar ? "w-full" : "md:ml-64"}>
        {children}
      </main>

      {!hideSidebar && isCreatePostOpen && (
        <CreatePostModal
          onClose={() => setIsCreatePostOpen(false)}
          onShare={handleShare}
        />
      )}
    </>
  );
}

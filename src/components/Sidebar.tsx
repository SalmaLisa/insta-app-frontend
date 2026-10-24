
"use client";

import { useState } from "react";
import {
  Home,
  Compass,
  MessageCircle,
  UserRound,
  PlusSquare,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-gray-100 ${
        active ? "font-bold bg-gray-100" : "font-normal"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

type SidebarProps = {
  onCreateClick?: () => void;
};

export default function Sidebar({ onCreateClick }: SidebarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const items = [
    { label: "Home", icon: <Home size={24} />, path: "/" },
    { label: "Explore", icon: <Compass size={24} />, path: "/explore" },
    
    { label: "Create", icon: <PlusSquare size={24} />, path: "" },
    {
      label: "Profile",
      icon: <UserRound size={24} />,
      path: "/profile",
    },
  ];

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Logout failed.");
      }

      setMoreOpen(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to log out. Please try again."
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-200 bg-white p-6 md:flex md:flex-col">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mb-10 flex items-center gap-3 text-left"
      >
        <span className="text-2xl font-bold">◎</span>
        <span className="text-2xl font-semibold tracking-tight">
          InstaApp
        </span>
      </button>

      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const active =
            item.path !== "" &&
            (item.path === "/"
              ? pathname === "/"
              : pathname === item.path ||
                pathname.startsWith(`${item.path}/`));

          return (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={active}
              onClick={() => {
                // if (item.label === "Create") {
                //   onCreateClick?.();
                //   return;
                // }
if (item.label === "Create") {
  console.log("Create button clicked:", pathname);
  console.log("onCreateClick:", typeof onCreateClick);

  onCreateClick?.();
  return;
}
                router.push(item.path);
              }}
            />
          );
        })}
      </nav>

      <div className="relative mt-auto">
        <SidebarItem
          icon={<Menu size={24} />}
          label="More"
          active={moreOpen}
          onClick={() => setMoreOpen((prev) => !prev)}
        />

        {moreOpen && (
          <div className="absolute bottom-14 left-0 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                alert("Settings clicked!");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 hover:bg-gray-100"
            >
              <Settings size={20} />
              Settings
            </button>

            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={20} />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

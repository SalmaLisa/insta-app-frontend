
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create your account.");
      }

      // Registration creates the account; login is a separate step.
      router.push("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="text-center text-3xl font-bold">Instagram</h1>

        <p className="mb-6 mt-2 text-center text-sm text-gray-500">
          Create an account to see photos and videos from your friends.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={30}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-gray-500"
          />

          <input
            type="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-gray-500"
          />

          <input
            type="password"
            placeholder="Password (at least 8 characters)"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-gray-500"
          />

          <input
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-gray-500"
          />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="my-6 border-t border-gray-200" />

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

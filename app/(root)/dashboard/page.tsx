"use client";

import { useSession } from "@/lib/auth-client";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome, {session?.user.email}!</p>
        <div className="mt-4">
          <a href="/auth/settings" className="text-blue-600 hover:underline">
            Account Settings
          </a>
        </div>
        <div className="mt-2">
          <a href="/auth/sign-out" className="text-red-600 hover:underline">
            Sign Out
          </a>
        </div>
      </div>
  );
}

"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {session?.user.email}!</p>
      <div className="mt-4">
        <Link href="/auth/settings" className="text-blue-600 hover:underline">
          Account Settings
        </Link>
      </div>
      <div className="mt-2">
        <Link href="/auth/sign-out" className="text-red-600 hover:underline">
          Sign Out
        </Link>
      </div>
    </div>
  );
}

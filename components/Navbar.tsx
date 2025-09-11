"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await authClient.signOut({ fetchOptions: { credentials: "include" } });
      router.push("auth/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* App Name */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              ScreenCast
            </h1>
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none">
                  <Avatar>
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                      alt="Profile"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 hidden sm:block ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={4}>
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email}
                  </p>
                </div>

                <DropdownMenuItem asChild>
                  <Link href={`/profile/${session?.user?.id}`}>
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

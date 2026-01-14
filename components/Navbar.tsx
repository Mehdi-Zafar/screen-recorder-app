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
import { buttonVariants } from "./ui/button";
import { getUserInitials } from "@/lib/helpers";
import { toast } from "sonner";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await authClient.signOut({ fetchOptions: { credentials: "include" } });
      router.push("/auth/sign-in");
      toast.success("Signed out successfully");
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
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Screen<span className="text-red-500">Cast</span>
              </h1>
            </Link>
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={session?.user?.image || undefined}
                        alt={session?.user?.name}
                      />
                      <AvatarFallback>
                        {getUserInitials(session?.user?.name)}
                      </AvatarFallback>
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
                    <Link href={`/profile/videos`}>
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
            ) : (
              <>
                <Link href="/auth/sign-in" className={buttonVariants()}>
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

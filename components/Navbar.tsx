"use client";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session } = useSession();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuClick = (action: any) => {
    console.log(action);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* App Name */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              ScreenCast
            </h1>
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <div className="dropdown-container">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none"
                  >
                    <Avatar>
                      <AvatarImage
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                        alt="Profile"
                      />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 hidden sm:block ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </DropdownMenuTrigger>

                {isDropdownOpen && (
                  <DropdownMenuContent align="end" sideOffset={4}>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        John Doe
                      </p>
                      <p className="text-xs text-gray-500">
                        john.doe@example.com
                      </p>
                    </div>

                    <DropdownMenuItem
                      onClick={() => handleMenuClick("profile")}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleMenuClick("settings")}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => handleMenuClick("logout")}>
                      {session ? (
                        <>
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign out
                        </>
                      ) : (
                        <>Sign in</>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 sm:hidden"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
}

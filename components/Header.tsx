"use client";

import { Camera, ChevronDown, Filter, Search, Upload, X } from "lucide-react";
import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";
import Link from "next/link";

interface Filter {
  dateRange: string[];
  duration: string[];
  author: string[];
  status: string[];
}

interface HeaderProps {
  placeholder?: string;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (value: Filter) => void;
  className?: string;
  title: string;
  subtitle: string;
  img?: string;
  initialSearchValue?: string;
}

export default function Header({
  placeholder = "Search videos...",
  onSearchChange,
  onFilterChange,
  className = "",
  title,
  subtitle,
  img,
  initialSearchValue = "",
}: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialSearchValue);
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: [],
    duration: [],
    author: [],
    status: [],
  });

  useEffect(() => {
    setSearchTerm(initialSearchValue);
  }, [initialSearchValue]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // ✅ Faster debounce - 200ms instead of 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (searchTerm.trim()) {
          params.set("q", searchTerm.trim());
        } else {
          params.delete("q");
        }

        router.push(`?${params.toString()}`, { scroll: false });
      });

      onSearchChange?.(searchTerm);
    }, 200); // ✅ 200ms feels more instant

    return () => clearTimeout(timer);
  }, [searchTerm, router, searchParams, onSearchChange]);

  const clearSearch = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push(window.location.pathname, { scroll: false });
    });
    onSearchChange?.("");
  };

  const handleFilterToggle = (category: string, value: string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[category].includes(value)) {
        newFilters[category] = newFilters[category].filter(
          (item) => item !== value
        );
      } else {
        newFilters[category] = [...newFilters[category], value];
      }
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      dateRange: [],
      duration: [],
      author: [],
      status: [],
    });
    onFilterChange?.({
      dateRange: [],
      duration: [],
      author: [],
      status: [],
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce(
      (acc, filters) => acc + filters.length,
      0
    );
  };

  const handleUpload = () => {
    console.log("Start recording clicked");
  };

  const handleRecord = () => {
    console.log("Download clicked");
  };

  const filterOptions = {
    dateRange: [
      { value: "today", label: "Today" },
      { value: "week", label: "This Week" },
      { value: "month", label: "This Month" },
      { value: "year", label: "This Year" },
    ],
    duration: [
      { value: "short", label: "Short (< 5 min)" },
      { value: "medium", label: "Medium (5-20 min)" },
      { value: "long", label: "Long (> 20 min)" },
    ],
    author: [
      { value: "john", label: "John Developer" },
      { value: "sarah", label: "Sarah Chen" },
      { value: "mike", label: "Mike Johnson" },
      { value: "alex", label: "Alex Rodriguez" },
    ],
    status: [
      { value: "published", label: "Published" },
      { value: "draft", label: "Draft" },
      { value: "processing", label: "Processing" },
    ],
  };

  return (
    <header className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between py-8 md:py-12">
        {/* Left Section */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Free
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-lg mb-4">
              {subtitle}
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                HD Quality
              </Badge>
              <Badge variant="outline" className="text-xs">
                No Watermark
              </Badge>
              <Badge variant="outline" className="text-xs">
                Easy Sharing
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Section - Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 ml-6">
          <Link href="/upload">
            <Button
              onClick={handleUpload}
              variant="destructive"
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Upload Video
            </Button>
          </Link>

          <Button
            onClick={handleRecord}
            variant="outline"
            size="lg"
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Record Video
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {/* ✅ Remove the spinner - it's distracting */}
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {getActiveFiltersCount()}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Date Range</DropdownMenuLabel>
              {filterOptions.dateRange.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedFilters.dateRange.includes(option.value)}
                  onCheckedChange={() =>
                    handleFilterToggle("dateRange", option.value)
                  }
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              {getActiveFiltersCount() > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clearAllFilters}
                    className="text-red-600"
                  >
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

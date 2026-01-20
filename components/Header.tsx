"use client";

import {
  Camera,
  ChevronDown,
  Filter,
  Search,
  Upload,
  X,
  ArrowUpDown,
} from "lucide-react";
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import Link from "next/link";

interface HeaderProps {
  placeholder?: string;
  className?: string;
  title: string;
  subtitle: string;
  img?: string;
  initialSearchValue?: string;
}

export default function Header({
  placeholder = "Search videos...",
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
  const [sortBy, setSortBy] = useState<string>("latest"); // ✅ Add sort state
  const [selectedFilters, setSelectedFilters] = useState<{
    dateRange: string[];
    duration: string[];
    visibility: string[];
  }>({
    dateRange: [],
    duration: [],
    visibility: [],
  });

  // ✅ Initialize from URL
  useEffect(() => {
    const dateRange =
      searchParams.get("dateRange")?.split(",").filter(Boolean) || [];
    const duration =
      searchParams.get("duration")?.split(",").filter(Boolean) || [];
    const visibility =
      searchParams.get("visibility")?.split(",").filter(Boolean) || [];
    const sort = searchParams.get("sortBy") || "latest";

    setSelectedFilters({
      dateRange,
      duration,
      visibility,
    });
    setSortBy(sort);
  }, []);

  useEffect(() => {
    setSearchTerm(initialSearchValue);
  }, [initialSearchValue]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // ✅ Update URL when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        updateURL();
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ Update URL when filters or sort changes
  useEffect(() => {
    startTransition(() => {
      updateURL();
    });
  }, [selectedFilters, sortBy]);

  // ✅ Central URL update function
  const updateURL = () => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    }

    if (selectedFilters.dateRange.length > 0) {
      params.set("dateRange", selectedFilters.dateRange.join(","));
    }
    if (selectedFilters.duration.length > 0) {
      params.set("duration", selectedFilters.duration.join(","));
    }
    if (selectedFilters.visibility.length > 0) {
      params.set("visibility", selectedFilters.visibility.join(","));
    }

    // ✅ Add sort parameter
    if (sortBy !== "latest") {
      params.set("sortBy", sortBy);
    }

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname, {
      scroll: false,
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleFilterToggle = (
    category: keyof typeof selectedFilters,
    value: string,
  ) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[category].includes(value)) {
        newFilters[category] = newFilters[category].filter(
          (item) => item !== value,
        );
      } else {
        newFilters[category] = [...newFilters[category], value];
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      dateRange: [],
      duration: [],
      visibility: [],
    });
    setSortBy("latest");
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce(
      (acc, filters) => acc + filters.length,
      0,
    );
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
    visibility: [
      { value: "public", label: "Public" },
      { value: "private", label: "Private" },
    ],
  };

  // ✅ Sort options
  const sortOptions = [
    { value: "latest", label: "Latest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "most-viewed", label: "Most Viewed" },
    { value: "least-viewed", label: "Least Viewed" },
    { value: "longest", label: "Longest Duration" },
    { value: "shortest", label: "Shortest Duration" },
    { value: "title-asc", label: "Title (A-Z)" },
    { value: "title-desc", label: "Title (Z-A)" },
  ];

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
              variant="destructive"
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Upload Video
            </Button>
          </Link>

          <Button
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
        </div>

        {/* Sort and Filter */}
        <div className="flex items-center gap-2">
          {/* ✅ Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Dropdown */}
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
              {/* Date Range */}
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

              {/* Duration */}
              <DropdownMenuLabel>Duration</DropdownMenuLabel>
              {filterOptions.duration.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedFilters.duration.includes(option.value)}
                  onCheckedChange={() =>
                    handleFilterToggle("duration", option.value)
                  }
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              {/* Visibility */}
              <DropdownMenuLabel>Visibility</DropdownMenuLabel>
              {filterOptions.visibility.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedFilters.visibility.includes(option.value)}
                  onCheckedChange={() =>
                    handleFilterToggle("visibility", option.value)
                  }
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}

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

      {/* Active Filters Display */}
      {(getActiveFiltersCount() > 0 || sortBy !== "latest") && (
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Sort Badge */}
          {sortBy !== "latest" && (
            <Badge
              variant="default"
              className="gap-1 cursor-pointer hover:bg-primary/80"
              onClick={() => setSortBy("latest")}
            >
              {sortOptions.find((s) => s.value === sortBy)?.label}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {/* Filter Badges */}
          {selectedFilters.dateRange.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => handleFilterToggle("dateRange", filter)}
            >
              {filterOptions.dateRange.find((f) => f.value === filter)?.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {selectedFilters.duration.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => handleFilterToggle("duration", filter)}
            >
              {filterOptions.duration.find((f) => f.value === filter)?.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {selectedFilters.visibility.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => handleFilterToggle("visibility", filter)}
            >
              {filterOptions.visibility.find((f) => f.value === filter)?.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </header>
  );
}

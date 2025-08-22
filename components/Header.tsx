"use client";
import { Camera, ChevronDown, Filter, Search, Upload, X } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
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

export default function Header({
  placeholder = "Search videos...",
  onSearchChange = (value) => {},
  onFilterChange = (value) => {},
  className = "",
  title,
  subtitle,
  img
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: [],
    duration: [],
    author: [],
    status: [],
  });

  // Filter options
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearchChange?.("");
  };

  const handleFilterToggle = (category: any, value: any) => {
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

  const removeFilter = (category: any, value: any) => {
    handleFilterToggle(category, value);
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

  const getAllActiveFilters = () => {
    const activeFilters: any[] = [];
    Object.entries(selectedFilters).forEach(([category, values]) => {
      values.forEach((value) => {
        const option = filterOptions[category].find(
          (opt) => opt.value === value
        );
        if (option) {
          activeFilters.push({ category, value, label: option.label });
        }
      });
    });
    return activeFilters;
  };
  const handleUpload = () => {
    console.log("Start recording clicked");
    // Add your recording logic here
  };

  const handleRecord = () => {
    console.log("Download clicked");
    // Add your download logic here
  };

  return (
    <header className="max-w-7xl mx-auto">
      {/* <div className="mx-auto px-4 sm:px-6 lg:px-8"> */}
        <div className="flex items-center justify-between py-8 md:py-12">
          {/* Left Section - Heading, Subheading, and Image */}
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {title}
                </h1>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  Free
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-gray-600 max-w-lg mb-4">
                {subtitle}
              </p>

              {/* Feature highlights */}
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

            {/* Image Card */}
            {/* <div className="hidden md:block flex-shrink-0">
              <Card className="p-1 shadow-lg">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop&crop=center" 
                    alt="Screen recording illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            </div> */}
          </div>

          {/* Right Section - Two Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 ml-6">
            <Button
              onClick={handleUpload}
              variant="destructive"
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Upload Video
            </Button>

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
      {/* </div> */}
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

              {/* Author */}
              <DropdownMenuLabel>Author</DropdownMenuLabel>
              {filterOptions.author.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedFilters.author.includes(option.value)}
                  onCheckedChange={() =>
                    handleFilterToggle("author", option.value)
                  }
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              {/* Status */}
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {filterOptions.status.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedFilters.status.includes(option.value)}
                  onCheckedChange={() =>
                    handleFilterToggle("status", option.value)
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
    </header>
  );
}

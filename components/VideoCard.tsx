'use client';

import React, { useState } from 'react';
import { MoreVertical, Play, Download, Share, Trash2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { VideoWithUser } from '@/lib/db/schema';
import { formatDuration, timeAgo } from '@/lib/utils';
import Link from 'next/link';

interface VideoCardProps{
  video:VideoWithUser;
  cardClass?:string;
}

export default function VideoCard({
  video
  ,cardClass
}:VideoCardProps){
  const [isHovered, setIsHovered] = useState(false);
  const {title,thumbnailUrl,duration,views,createdAt,user} = video
  const authorName = user?.name ?? "Jack"
  const authorAvatar = user?.image ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
  const videoCreatedAt = timeAgo(createdAt);
  const durationFormatted = formatDuration(duration)

  const handleMenuAction = (action:any) => {
    console.log(`${action} clicked for video: ${title}`);
    // Add your action handlers here
  };

  const handleVideoClick = () => {
    console.log(`Playing video: ${title}`);
    // Add your video play logic here
  };

  return (
    <Card 
      className={`group overflow-hidden transition-all duration-200 hover:shadow-lg ${cardClass} pt-0`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Thumbnail Section */}
        <Link href={`/video/${video.id}`}>
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          
          {/* Duration Badge */}
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 right-2 bg-black/80 text-white hover:bg-black/80 text-xs px-2 py-1"
          >
            {durationFormatted}
          </Badge>
          
          {/* Play Button Overlay */}
          <div 
            className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleVideoClick}
          >
            <Button size="icon" className="h-12 w-12 rounded-full bg-white/90 text-black hover:bg-white">
              <Play className="h-5 w-5 ml-1" fill="currentColor" />
            </Button>
          </div>
        </div>
        </Link>

        {/* Video Info Section */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Author Avatar */}
            <div className="flex-shrink-0 pt-1">
              <Avatar className="h-9 w-9">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback className="text-sm">
                  {authorName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Title and Author Info */}
            <div className="flex-1 min-w-0">
              <h3 
                className="font-medium text-sm leading-5 text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600 transition-colors inline"
                onClick={handleVideoClick}
                title={title}
              >
                {title}
              </h3>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-700">{authorName}</p>
                <div className="flex items-center space-x-1">
                  <span>{views}</span>
                  <span>•</span>
                  <span>{videoCreatedAt}</span>
                </div>
              </div>
            </div>

            {/* Options Menu */}
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleMenuAction('play')}>
                    <Play className="mr-2 h-4 w-4" />
                    Watch Now
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => handleMenuAction('download')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => handleMenuAction('share')}>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => handleMenuAction('edit')}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => handleMenuAction('delete')}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
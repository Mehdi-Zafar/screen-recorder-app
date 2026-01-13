// /hooks/useInfiniteScroll.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseInfiniteScrollOptions<T> {
  initialData: T[];
  loadMoreAction: (offset: number, limit: number) => Promise<{ videos: T[]; hasMore: boolean }>;
  limit?: number;
}

export function useInfiniteScroll<T>({
  initialData,
  loadMoreAction,
  limit = 20,
}: UseInfiniteScrollOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Intersection observer to detect when user scrolls to bottom
  const { ref, inView } = useInView({
    threshold: 0.1, // Trigger when 10% visible
    triggerOnce: false, // Allow multiple triggers
  });

  const loadMore = useCallback(async () => {
    // Prevent loading if already loading or no more data
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);

    try {
      // Calculate offset from current data length
      const currentOffset = data.length;

      
      // Call server action
      const result = await loadMoreAction(currentOffset, limit);

      // Append new videos to existing data
      if (result.videos.length > 0) {
        setData(prev => [...prev, ...result.videos]);
      }
      
      // Update hasMore flag
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('❌ Client: Error loading more:', error);
      setHasMore(false); // Stop trying on error
    } finally {
      setIsLoading(false);
    }
  }, [data.length, isLoading, hasMore, loadMoreAction, limit]);

  // Trigger load when scroll indicator is in view
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);

  return {
    data,
    isLoading,
    hasMore,
    loadMore,
    scrollTriggerRef: ref,
  };
}
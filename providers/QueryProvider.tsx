"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ✅ Data stays fresh for 5 minutes (no refetch during this time)
            staleTime: 5 * 60 * 1000, // 5 minutes

            // ✅ Keep cached data for 10 minutes even if unused
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

            // ✅ Don't refetch when window regains focus (like YouTube)
            refetchOnWindowFocus: false,

            // ✅ Don't refetch when component remounts
            refetchOnMount: false,

            // ✅ Retry failed requests 3 times
            retry: 3,

            // ✅ Keep previous data while fetching new data (smooth transitions)
            placeholderData: (previousData) => previousData,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ✅ DevTools to inspect cache (only in development) */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}

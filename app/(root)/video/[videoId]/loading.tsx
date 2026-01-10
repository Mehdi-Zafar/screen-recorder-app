export default function VideoLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6 animate-pulse">
        {/* Video Player Skeleton */}
        <div className="w-full aspect-video bg-muted rounded-lg" />

        {/* Title Skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>

        {/* Divider */}
        <hr className="border-border" />

        {/* User Info Skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-48" />
          </div>
        </div>

        {/* Divider */}
        <hr className="border-border" />

        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded w-24" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

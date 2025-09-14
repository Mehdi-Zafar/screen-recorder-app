// app/api/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { VideoService } from "@/lib/services/video-service";
import { z } from "zod";
import { NewVideo } from "@/lib/db/schema";
import { withAuth } from "@/lib/auth-middleware";

// Validation schema for video creation
const createVideoSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  videoUrl: z.string().url("Invalid video URL").min(1, "Video URL is required"),
  thumbnailUrl: z
    .string()
    .url("Invalid thumbnail URL")
    .min(1, "Thumbnail URL is required"),
  visibility: z.enum(["public", "private"], {
    error: "Visibility must be either 'public' or 'private'",
  }),
  duration:z.number().min(0,"Duration must be a positive number"),
});

export async function POST(req: NextRequest) {
  try {
    // Centralized authentication check
    const authResult = await withAuth(req);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createVideoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { title, description, videoUrl, thumbnailUrl, visibility,duration } =
      validationResult.data;
    const newVideo: NewVideo = {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      visibility,
      duration,
      userId: authResult.user?.id,
    };
    // Create video entry in database
    const video = await VideoService.createVideo(newVideo);

    // Return success response with created video
    return NextResponse.json(
      {
        success: true,
        message: "Video created successfully",
        video: {
          id: video.id,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          visibility: video.visibility,
          userId: video.userId,
          duration:video.duration,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Video creation error:", error);

    // Handle different types of errors
    if (error instanceof Error) {
      // Database constraint errors, etc.
      if (error.message.includes("unique constraint")) {
        return NextResponse.json(
          { error: "A video with this title already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's videos
export async function GET(req: NextRequest) {
  try {
    // Centralized authentication check
    const authResult = await withAuth(req);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get query parameters for pagination and filtering
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const visibility = url.searchParams.get("visibility") as
      | "public"
      | "private"
      | null;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Fetch user's videos with optional filtering
    const videos = await VideoService.getUserVideos(authResult.user.id, {
      page,
      limit,
      visibility,
    });

    return NextResponse.json({
      success: true,
      videos: videos.data,
      pagination: {
        page,
        limit,
        total: videos.total,
        totalPages: Math.ceil(videos.total / limit),
      },
    });
  } catch (error) {
    console.error("Videos fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

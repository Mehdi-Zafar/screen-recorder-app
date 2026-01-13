import { NextRequest } from "next/server";
import { auth } from "./auth";

export async function withAuth(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return {
      error: "Unauthorized",
      status: 401,
      user: null,
    };
  }

  return {
    error: null,
    status: 200,
    user: session.user,
  };
}

// Type for authenticated request
export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    // Add other user properties as needed
  };
}

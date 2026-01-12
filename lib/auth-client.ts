import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.AUTHCLIENT_BASE_URL,
});

// Export the hooks and methods for easier importing
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  updateUser,
  changePassword,
  // Add other methods you need
} = authClient;

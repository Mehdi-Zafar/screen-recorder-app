"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => {
        // Clear router cache (protected routes)
        router.refresh();
      }}
      Link={Link}
      toast={({ message, variant, ...props }) => {
        if (variant === "error") {
          toast.error(message);
        } else if (variant === "success") {
          toast.success(message);
        } else {
          toast(message);
        }
      }}
    >
      {children}
    </AuthUIProvider>
  );
}

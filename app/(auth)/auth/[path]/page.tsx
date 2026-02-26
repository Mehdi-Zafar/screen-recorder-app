import { buttonVariants } from "@/components/ui/button";
import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="container h-screen flex grow flex-col items-center justify-center self-center p-4 md:p-6">
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          <ArrowLeftIcon /> <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </div>
      <AuthView
        path={path}
        socialLayout="vertical"
        classNames={{
          form: {
            forgotPasswordLink: "cursor-pointer",
            button: "cursor-pointer",
          },
          footerLink: "cursor-pointer",
        }}
      />
    </main>
  );
}

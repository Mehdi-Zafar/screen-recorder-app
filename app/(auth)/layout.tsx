import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

export default function layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children} <Toaster position="top-center" /></>;
}

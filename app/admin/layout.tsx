import { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import NextTopLoader from "nextjs-toploader";
import { cookies } from "next/headers";
import "./admin.css";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_auth")?.value as "owner" | "manager" | "waiter" | undefined;

  return (
    <ThemeProvider>
      <NextTopLoader color="#eab308" showSpinner={false} />
      <AdminShell role={role}>{children}</AdminShell>
    </ThemeProvider>
  );
}

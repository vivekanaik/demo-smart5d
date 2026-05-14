import { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import NextTopLoader from "nextjs-toploader";
import "./admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NextTopLoader color="#eab308" showSpinner={false} />
      <AdminShell>{children}</AdminShell>
    </ThemeProvider>
  );
}

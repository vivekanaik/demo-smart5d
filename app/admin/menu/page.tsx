import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MenuTable } from "@/components/admin/MenuTable";

export const metadata = {
  title: "Menu Management | Admin",
};

export default async function MenuPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("admin_auth")?.value;
  
  if (role === "waiter") {
    redirect("/admin");
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Menu Management</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Add, update, or remove dishes from your restaurant's menu.
        </p>
      </div>
      
      <MenuTable />
    </div>
  );
}

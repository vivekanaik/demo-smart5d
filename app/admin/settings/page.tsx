import { getSettings } from "@/actions/settings";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { safeQuery } from "@/lib/safe-query";
import { OfflineFallback } from "@/components/admin/OfflineFallback";

export default async function AdminSettingsPage() {
  const settings = await safeQuery(() => getSettings(), null);

  if (!settings) {
    return <OfflineFallback title="Settings Unavailable" description="Settings couldn't be loaded. Please connect to the internet to load and sync it first." />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Configure global application preferences.</p>
        </div>
      </div>

      <AdminSettingsClient initialSettings={settings} />
    </div>
  );
}

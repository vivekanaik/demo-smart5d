import Link from "next/link";
import { SearchX, ArrowLeft } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center text-center px-4">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
        <SearchX className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
        Page Not Found
      </h1>
      <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
        We couldn't find the admin page you're looking for. It might have been moved or doesn't exist yet.
      </p>
      
      <Link 
        href="/admin" 
        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Dashboard
      </Link>
    </div>
  );
}

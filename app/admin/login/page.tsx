import { ChefHat } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <div className="text-center">
          <div className="mx-auto flex h-16 items-center justify-center">
            <img src="/esvalo.png" alt="Esvalo Logo" className="h-12 w-auto object-contain" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access the Smart5D POS dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Role
              </label>
              <select className="admin-select mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 bg-white text-zinc-900 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
                <option value="chef">Chef</option>
              </select>
            </div>
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Access PIN / Password
              </label>
              <input
                id="pin"
                name="pin"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 bg-white text-zinc-900 placeholder-zinc-400 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="Enter your credentials"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-yellow-600 focus:ring-yellow-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-900 dark:text-zinc-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-yellow-600 hover:text-yellow-500 dark:text-yellow-400">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="button"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-yellow-600 py-2.5 px-4 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:hover:bg-yellow-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

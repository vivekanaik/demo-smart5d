import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: any; // We'll type this properly in the parent
  onAdd: (item: any) => void;
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  // Parse the price string (e.g., "₹480" to number 480)
  const numericPrice = parseInt(item.price.replace(/\D/g, ""));

  return (
    <div 
      onClick={() => onAdd({ ...item, numericPrice })}
      className="group relative flex min-h-36 cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-yellow-500 hover:shadow-md active:scale-95 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-yellow-500"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border",
          item.diet === "Veg" 
            ? "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-900/50 dark:text-yellow-400 dark:bg-yellow-900/20"
            : "border-red-200 text-red-700 bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/20"
        )}>
          {item.diet}
        </span>
        <span className="flex-shrink-0 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          ₹{numericPrice}
        </span>
      </div>
      
      <div>
        <h3 className="mb-1 font-semibold leading-tight text-zinc-900 dark:text-zinc-100">{item.name}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{item.description}</p>
      </div>
    </div>
  );
}

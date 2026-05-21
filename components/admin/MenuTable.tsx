"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from "@/actions/settings";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  X, 
  Loader2, 
  Leaf, 
  Drumstick,
  EyeOff,
  Eye,
  ChevronDown
} from "lucide-react";

type Nutrition = {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  diet: "Veg" | "Non-Veg";
  ingredients: string[];
  nutrition: Nutrition | null;
  modelUrl: string;
  posterUrl: string | null;
  isAvailable: number;
};

export function MenuTable() {
  const { data: items = [], isLoading } = useSWR<MenuItem[]>("menuItems", () => getMenuItems() as Promise<MenuItem[]>);
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToHide, setItemToHide] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [diet, setDiet] = useState<"Veg" | "Non-Veg">("Veg");
  const [ingredientsStr, setIngredientsStr] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [modelUrl, setModelUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const categories = ["All", ...Array.from(new Set(items.map(i => i.category)))].filter(Boolean);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setDiet("Veg");
    setIngredientsStr("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setModelUrl("");
    setPosterUrl("");
    setIsAvailable(true);
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setCategory(item.category);
    setDiet(item.diet);
    setIngredientsStr(item.ingredients ? item.ingredients.join(", ") : "");
    setCalories(item.nutrition?.calories || "");
    setProtein(item.nutrition?.protein || "");
    setCarbs(item.nutrition?.carbs || "");
    setFat(item.nutrition?.fat || "");
    setModelUrl(item.modelUrl || "");
    setPosterUrl(item.posterUrl || "");
    setIsAvailable(item.isAvailable === 1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const nutritionData: Nutrition = { calories, protein, carbs, fat };
    const ingredientsArray = ingredientsStr.split(",").map(s => s.trim()).filter(Boolean);

    const payload = {
      name,
      description,
      price,
      category,
      diet,
      ingredients: ingredientsArray,
      nutrition: nutritionData,
      modelUrl,
      posterUrl: posterUrl || "/5d.png",
      isAvailable: isAvailable ? 1 : 0
    };

    if (editingItem) {
      await updateMenuItem(editingItem.id, payload);
    } else {
      await addMenuItem(payload);
    }

    await mutate("menuItems");
    setIsSubmitting(false);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteMenuItem(itemToDelete.id);
    await mutate("menuItems");
    setItemToDelete(null);
  };

  const toggleAvailability = async (item: MenuItem) => {
    if (item.isAvailable === 1) {
      setItemToHide(item);
    } else {
      await updateMenuItem(item.id, { isAvailable: 1 });
      await mutate("menuItems");
    }
  };

  const confirmHide = async () => {
    if (!itemToHide) return;
    await updateMenuItem(itemToHide.id, { isAvailable: 0 });
    await mutate("menuItems");
    setItemToHide(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 pr-9 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer appearance-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Category</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Price</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Diet</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.posterUrl && (
                          <img src={item.posterUrl} alt={item.name} className="w-8 h-8 rounded-md object-cover bg-zinc-100" />
                        )}
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-[200px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-xs">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {item.price}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        {item.diet === "Veg" ? (
                          <><Leaf className="w-3.5 h-3.5 text-green-500" /> <span className="text-green-600 dark:text-green-400">Veg</span></>
                        ) : (
                          <><Drumstick className="w-3.5 h-3.5 text-red-500" /> <span className="text-red-600 dark:text-red-400">Non-Veg</span></>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleAvailability(item)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          item.isAvailable === 1 
                            ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20" 
                            : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                        }`}
                      >
                        {item.isAvailable === 1 ? <><Eye className="w-3.5 h-3.5" /> In Stock</> : <><EyeOff className="w-3.5 h-3.5" /> Out of Stock</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl my-8">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                {editingItem ? "Edit Menu Item" : "Add New Item"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name *</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100"
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description *</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100 resize-none"
                    placeholder="Brief description of the dish..."
                  />
                </div>

                {/* Category & Price */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category *</label>
                  <div className="relative">
                    <select
                      required
                      value={
                        category === "" 
                          ? "" 
                          : categories.includes(category) 
                            ? category 
                            : "Other"
                      }
                      onChange={(e) => {
                         if (e.target.value === "Other") {
                           setCategory("New Category"); 
                         } else {
                           setCategory(e.target.value);
                         }
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100 appearance-none pr-10"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.filter(c => c !== "All").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Other">Add New...</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                  {(!categories.includes(category) && category !== "") ? (
                    <input
                      required
                      type="text"
                      value={category === "New Category" ? "" : category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 mt-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100"
                      placeholder="Enter custom category name"
                    />
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price *</label>
                  <input
                    required
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100"
                    placeholder="e.g., ₹480"
                  />
                </div>

                {/* Diet & Availability */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Dietary Preference</label>
                  <div className="relative">
                    <select
                      value={diet}
                      onChange={(e) => setDiet(e.target.value as "Veg" | "Non-Veg")}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100 appearance-none pr-10"
                    >
                      <option value="Veg">Veg</option>
                      <option value="Non-Veg">Non-Veg</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5 flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-2 w-full border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="w-4 h-4 accent-yellow-500 rounded"
                    />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Currently Available
                    </span>
                  </label>
                </div>

                {/* Ingredients */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={ingredientsStr}
                    onChange={(e) => setIngredientsStr(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100"
                    placeholder="Tomato, Cheese, Basil"
                  />
                </div>

                {/* Media URLs */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">3D Model URL *</label>
                  <input
                    required
                    type="text"
                    value={modelUrl}
                    onChange={(e) => setModelUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                    placeholder="https://.../model.glb"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Poster Image URL (Fallback)</label>
                  <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                    placeholder="/5d.png"
                  />
                </div>

                {/* Nutrition */}
                <div className="md:col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Nutrition Info (Optional)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500">Calories</label>
                      <input type="text" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100" placeholder="e.g. 250 kcal" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500">Protein</label>
                      <input type="text" value={protein} onChange={(e) => setProtein(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100" placeholder="e.g. 12g" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500">Carbs</label>
                      <input type="text" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100" placeholder="e.g. 30g" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500">Fat</label>
                      <input type="text" value={fat} onChange={(e) => setFat(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100" placeholder="e.g. 8g" />
                    </div>
                  </div>
                </div>

              </div>
            </form>

            <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingItem ? "Save Changes" : "Add Item"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Hide Confirmation Modal */}
      {itemToHide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Hide Item?</h3>
            <p className="text-zinc-500 text-sm mb-6">
              Are you sure you want to mark <span className="font-semibold text-zinc-700 dark:text-zinc-300">{itemToHide.name}</span> as out of stock? It will be greyed out on the main menu.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setItemToHide(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmHide}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Yes, Out of Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-bold text-lg text-red-600 dark:text-red-500 mb-2">Delete Item?</h3>
            <p className="text-zinc-500 text-sm mb-6">
              Are you sure you want to permanently delete <span className="font-semibold text-zinc-700 dark:text-zinc-300">{itemToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

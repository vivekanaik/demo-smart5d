import { db } from "../db";
import { menuItems } from "../db/schema";

const MENU_ITEMS = [
  {
    name: "Truffle Mushroom Pizza",
    description: "Wood-fired pizza with creamy truffle sauce, wild mushrooms, mozzarella, and fresh basil.",
    price: "₹480",
    category: "Main Course",
    diet: "Veg" as const,
    ingredients: ["Pizza Dough", "Mozzarella", "Mushrooms", "Truffle Oil", "Garlic", "Basil"],
    nutrition: { calories: "420 kcal", protein: "14g", carbs: "48g", fat: "18g" },
    modelUrl: "mushroompizza-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/pizza.webp"
  },
  {
    name: "Classic Veggie Burger",
    description: "Grilled veggie patty with lettuce, tomato, cheese, and house sauce in a toasted bun.",
    price: "₹220",
    category: "Chef Special",
    diet: "Veg" as const,
    ingredients: ["Burger Bun", "Veg Patty", "Lettuce", "Tomato", "Cheese Slice", "Mayonnaise"],
    nutrition: { calories: "380 kcal", protein: "10g", carbs: "42g", fat: "16g" },
    modelUrl: "hamburger3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/burger.webp"
  },
  {
    name: "Spicy Veg Ramen",
    description: "Rich vegetable broth ramen with noodles, tofu, corn, mushrooms, and chili oil.",
    price: "₹350",
    category: "Main Course",
    diet: "Veg" as const,
    ingredients: ["Ramen Noodles", "Tofu", "Corn", "Mushrooms", "Vegetable Broth", "Chili Oil"],
    nutrition: { calories: "460 kcal", protein: "18g", carbs: "58g", fat: "14g" },
    modelUrl: "pastadish-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/ramen.webp"
  },
  {
    name: "Pesto Paneer Noodles",
    description: "Stir-fried noodles tossed in creamy basil pesto with grilled paneer, crunchy vegetables, and herbs.",
    price: "₹300",
    category: "Main Course",
    diet: "Veg" as const,
    ingredients: ["Noodles", "Paneer", "Basil Pesto Sauce", "Capsicum", "Onion", "Cherry Tomatoes", "Olive Oil", "Garlic", "Chili Flakes"],
    nutrition: { calories: "480 kcal", protein: "18g", carbs: "58g", fat: "18g" },
    modelUrl: "pastadish-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/pasta.webp"
  },
  {
    name: "Bombay Sandwich",
    description: "Grilled Mumbai-style sandwich layered with spiced potato filling, fresh cucumber, tomato, onion, mint chutney, and cheese, served with fries.",
    price: "₹180",
    category: "Starters",
    diet: "Veg" as const,
    ingredients: ["Bread", "Boiled Potato", "Cucumber", "Tomato", "Onion", "Capsicum", "Mint Chutney", "Butter", "Cheese", "Chaat Masala"],
    nutrition: { calories: "350 kcal", protein: "10g", carbs: "45g", fat: "14g" },
    modelUrl: "sandwich3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/sandwich.webp"
  },
  {
    name: "Mediterranean Feta Salad",
    description: "Crisp greens, kalamata olives, cucumber, cherry tomatoes, and feta cheese with a light vinaigrette.",
    price: "₹250",
    category: "Salads",
    diet: "Veg" as const,
    ingredients: ["Mixed Greens", "Feta Cheese", "Olives", "Cucumber", "Cherry Tomatoes", "Vinaigrette"],
    nutrition: { calories: "210 kcal", protein: "8g", carbs: "12g", fat: "16g" },
    modelUrl: "vegetablesalad-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/bowl.webp"
  },
  {
    name: "Artisan Garlic Bread",
    description: "Freshly baked sourdough bread brushed with roasted garlic and herb butter.",
    price: "₹150",
    category: "Breads",
    diet: "Veg" as const,
    ingredients: ["Sourdough", "Butter", "Garlic", "Parsley", "Sea Salt"],
    nutrition: { calories: "320 kcal", protein: "6g", carbs: "45g", fat: "12g" },
    modelUrl: "garlicbread-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/bread.webp"
  },
  {
    name: "Obsidian Lava Dessert",
    description: "Molten dark chocolate cake served over a bed of edible gold crumbs and liquid nitrogen.",
    price: "₹450",
    category: "Desserts",
    diet: "Veg" as const,
    ingredients: ["Dark Chocolate", "Flour", "Butter", "Eggs", "Sugar", "Gold Crumbs"],
    nutrition: { calories: "580 kcal", protein: "8g", carbs: "52g", fat: "35g" },
    modelUrl: "chocolatelava-cake-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/lava-cake.webp"
  },
  {
    name: "Blue Galactic Mojito",
    description: "A visually striking mix of blue curaçao, mint, lime, and sparkling water.",
    price: "₹190",
    category: "Drinks",
    diet: "Veg" as const,
    ingredients: ["Blue Curaçao Syrup", "Mint", "Lime", "Sparkling Water", "Ice"],
    nutrition: { calories: "140 kcal", protein: "0g", carbs: "35g", fat: "0g" },
    modelUrl: "bluecocktail-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/drink.webp"
  },
  {
    name: "Chicken Tikka Skewers",
    description: "Tender chicken chunks marinated in spiced yogurt, grilled to perfection.",
    price: "₹320",
    category: "Starters",
    diet: "Non-Veg" as const,
    ingredients: ["Chicken Breast", "Yogurt", "Tikka Masala", "Lemon Juice", "Garlic", "Ginger"],
    nutrition: { calories: "280 kcal", protein: "35g", carbs: "8g", fat: "12g" },
    modelUrl: "grilled-kebab-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/skewer.webp"
  }
];

async function seed() {
  console.log("Seeding menu items...");
  try {
    await db.insert(menuItems).values(MENU_ITEMS);
    console.log("✅ Successfully seeded menu items!");
  } catch (error) {
    console.error("❌ Error seeding menu items:", error);
  }
  process.exit(0);
}

seed();

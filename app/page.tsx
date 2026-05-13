// page.tsx
"use client";

import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import DishViewer from "@/components/DishViewer";
import { 
  Star, Utensils, ChefHat, Cake, Leaf, Croissant, Coffee, 
  LayoutGrid, Search, List as ListIcon, Plus, Minus, User, X, CheckCircle2, Mic, Box
} from "lucide-react";

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
import { IoSearch } from "react-icons/io5";
import { RiBowlLine } from "react-icons/ri";
import { submitOrder } from "@/actions/orders"; 
import { getMenuItems, getSettings } from "@/actions/settings"; 
import { createServiceRequest } from "@/actions/requests"; // ✅ Updated Import

const MODELS_BASE_URL = process.env.NEXT_PUBLIC_MODELS_BASE_URL?.trim();

function resolveModelUrl(modelPath: string) {
  if (!modelPath) return modelPath;
  if (/^https?:\/\//i.test(modelPath)) return modelPath;

  const normalizedPath = modelPath.replace(/^\/+/, "");
  if (!MODELS_BASE_URL) return `/${normalizedPath}`;

  return `${MODELS_BASE_URL.replace(/\/+$/, "")}/${normalizedPath}`;
}

// ✅ Offset Dummy IDs to 1001+ to avoid clashing with DB items which start at 1
const MENU_ITEMS = [
  {
    id: 1001,
    name: "Truffle Mushroom Pizza",
    description: "Wood-fired pizza with creamy truffle sauce, wild mushrooms, mozzarella, and fresh basil.",
    price: "₹480",
    category: "Main Course",
    diet: "Veg",
    ingredients: ["Pizza Dough", "Mozzarella", "Mushrooms", "Truffle Oil", "Garlic", "Basil"],
    nutrition: { calories: "420 kcal", protein: "14g", carbs: "48g", fat: "18g" },
    modelUrl: "mushroompizza-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/pizza.webp"
  },
  {
    id: 1002,
    name: "Classic Veggie Burger",
    description: "Grilled veggie patty with lettuce, tomato, cheese, and house sauce in a toasted bun.",
    price: "₹220",
    category: "Chef Special",
    diet: "Veg",
    ingredients: ["Burger Bun", "Veg Patty", "Lettuce", "Tomato", "Cheese Slice", "Mayonnaise"],
    nutrition: { calories: "380 kcal", protein: "10g", carbs: "42g", fat: "16g" },
    modelUrl: "hamburger3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/burger.webp"
  },
  {
    id: 1003,
    name: "Spicy Veg Ramen",
    description: "Rich vegetable broth ramen with noodles, tofu, corn, mushrooms, and chili oil.",
    price: "₹350",
    category: "Main Course",
    diet: "Veg",
    ingredients: ["Ramen Noodles", "Tofu", "Corn", "Mushrooms", "Vegetable Broth", "Chili Oil"],
    nutrition: { calories: "460 kcal", protein: "18g", carbs: "58g", fat: "14g" },
    modelUrl: "pastadish-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/ramen.webp"
  },
  {
    id: 1004,
    name: "Pesto Paneer Noodles",
    description: "Stir-fried noodles tossed in creamy basil pesto with grilled paneer, crunchy vegetables, and herbs.",
    price: "₹300",
    category: "Main Course",
    diet: "Veg",
    ingredients: ["Noodles", "Paneer", "Basil Pesto Sauce", "Capsicum", "Onion", "Cherry Tomatoes", "Olive Oil", "Garlic", "Chili Flakes"],
    nutrition: { calories: "480 kcal", protein: "18g", carbs: "58g", fat: "18g" },
    modelUrl: "pastadish-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/pasta.webp"
  },
  {
    id: 1005,
    name: "Bombay Sandwich",
    description: "Grilled Mumbai-style sandwich layered with spiced potato filling, fresh cucumber, tomato, onion, mint chutney, and cheese, served with fries.",
    price: "₹180",
    category: "Starters",
    diet: "Veg",
    ingredients: ["Bread", "Boiled Potato", "Cucumber", "Tomato", "Onion", "Capsicum", "Mint Chutney", "Butter", "Cheese", "Chaat Masala"],
    nutrition: { calories: "350 kcal", protein: "10g", carbs: "45g", fat: "14g" },
    modelUrl: "sandwich3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/sandwich.webp"
  },
  {
    id: 1006,
    name: "Mediterranean Feta Salad",
    description: "Crisp greens, kalamata olives, cucumber, cherry tomatoes, and feta cheese with a light vinaigrette.",
    price: "₹250",
    category: "Salads",
    diet: "Veg",
    ingredients: ["Mixed Greens", "Feta Cheese", "Olives", "Cucumber", "Cherry Tomatoes", "Vinaigrette"],
    nutrition: { calories: "210 kcal", protein: "8g", carbs: "12g", fat: "16g" },
    modelUrl: "vegetablesalad-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/bowl.webp"
  },
  {
    id: 1007,
    name: "Artisan Garlic Bread",
    description: "Freshly baked sourdough bread brushed with roasted garlic and herb butter.",
    price: "₹150",
    category: "Breads",
    diet: "Veg",
    ingredients: ["Sourdough", "Butter", "Garlic", "Parsley", "Sea Salt"],
    nutrition: { calories: "320 kcal", protein: "6g", carbs: "45g", fat: "12g" },
    modelUrl: "garlicbread-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/bread.webp"
  },
  {
    id: 1008,
    name: "Obsidian Lava Dessert",
    description: "Molten dark chocolate cake served over a bed of edible gold crumbs and liquid nitrogen.",
    price: "₹450",
    category: "Desserts",
    diet: "Veg",
    ingredients: ["Dark Chocolate", "Flour", "Butter", "Eggs", "Sugar", "Gold Crumbs"],
    nutrition: { calories: "580 kcal", protein: "8g", carbs: "52g", fat: "35g" },
    modelUrl: "chocolatelava-cake-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/lava-cake.webp"
  },
  {
    id: 1009,
    name: "Blue Galactic Mojito",
    description: "A visually striking mix of blue curaçao, mint, lime, and sparkling water.",
    price: "₹190",
    category: "Drinks",
    diet: "Veg",
    ingredients: ["Blue Curaçao Syrup", "Mint", "Lime", "Sparkling Water", "Ice"],
    nutrition: { calories: "140 kcal", protein: "0g", carbs: "35g", fat: "0g" },
    modelUrl: "bluecocktail-3d-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/drink.webp"
  },
  {
    id: 1010,
    name: "Chicken Tikka Skewers",
    description: "Tender chicken chunks marinated in spiced yogurt, grilled to perfection.",
    price: "₹320",
    category: "Starters",
    diet: "Non-Veg",
    ingredients: ["Chicken Breast", "Yogurt", "Tikka Masala", "Lemon Juice", "Garlic", "Ginger"],
    nutrition: { calories: "280 kcal", protein: "35g", carbs: "8g", fat: "12g" },
    modelUrl: "grilled-kebab-model-v1.glb",
    posterUrl: "https://pub-1c494745a7714afbbe5cbdba7ad19931.r2.dev/skewer.webp"
  }
];

const CATEGORIES = [
  { id: 'All', label: 'All', icon: LayoutGrid },
  { id: 'Chef Special', label: "Chef's Special", icon: Star },
  { id: 'Starters', label: 'Starters', icon: Utensils },
  { id: 'Main Course', label: 'Main Course', icon: ChefHat },
  { id: 'Salads', label: 'Salads', icon: Leaf },
  { id: 'Breads', label: 'Breads', icon: Croissant },
  { id: 'Desserts', label: 'Desserts', icon: Cake },
  { id: 'Drinks', label: 'Drinks', icon: Coffee },
];

const TRANSLATIONS: Record<string, { [key: string]: { name: string; description: string } }> = {
  "Truffle Mushroom Pizza": {
    en: { name: "Truffle Mushroom Pizza", description: "Wood-fired pizza with creamy truffle sauce, wild mushrooms, mozzarella, and fresh basil." },
    hi: { name: "ट्रफल मशरूम पिज्जा", description: "क्रीमी ट्रफल सॉस, जंगली मशरूम, मोज़ेरेला और ताज़ी तुलसी के साथ लकड़ी पर पकाया गया पिज़्ज़ा।" },
    mr: { name: "ट्रफल मशरूम पिझ्झा", description: "क्रीमी ट्रफल सॉस, जंगली मशरूम, मोझारेला आणि ताज्या तुळशीसह लाकडावर भाजलेला पिझ्झा." },
    gu: { name: "ટ્રફલ મશરૂમ પિઝા", description: "ક્રીમી ટ્રફલ સોસ, જંગલી મશરૂમ્સ, મોઝેરેલા અને તાજી તુલસીનો છોડ સાથે વુડ-ફાયર્ડ પિઝા." }
  },
  "Classic Veggie Burger": {
    en: { name: "Classic Veggie Burger", description: "Grilled veggie patty with lettuce, tomato, cheese, and house sauce in a toasted bun." },
    hi: { name: "क्लासिक वेजी बर्गर", description: "ग्रिल्ड वेज पैटी के साथ लेट्यूस, टमाटर, चीज़ और हाउस सॉस एक टोस्टेड बन में।" },
    mr: { name: "क्लासिक व्हेज बर्गर", description: "लेट्युस, टोमॅटो, चीज आणि हाऊस सॉससह ग्रिल केलेली व्हेज पॅटी टोस्टेड बनमध्ये." },
    gu: { name: "ક્લાસિક વેજી બર્ગર", description: "લેટીસ, ટામેટા, ચીઝ અને હાઉસ સોસ સાથે શેકેલા વેજ પેટી." }
  },
  "Spicy Veg Ramen": {
    en: { name: "Spicy Veg Ramen", description: "Rich vegetable broth ramen with noodles, tofu, corn, mushrooms, and chili oil." },
    hi: { name: "मसालेदार वेज रेमन", description: "नूडल्स, टोफू, मक्का, मशरूम और चिली ऑयल के साथ रिच वेजिटेबल ब्रोथ रेमन।" },
    mr: { name: "मसालेदार व्हेज रामेन", description: "नूडल्स, टोफू, कॉर्न, मशरूम आणि चिली ऑइलसह रिच व्हेजिटेबल ब्रोथ रामेन." },
    gu: { name: "મસાલેદાર વેજ રામેન", description: "નૂડલ્સ, ટોફુ, મકાઈ, મશરૂમ્સ અને મરચાંના તેલ સાથે સમૃદ્ધ શાકભાજી સૂપ રામેન." }
  },
  "Pesto Paneer Noodles": {
    en: { name: "Pesto Paneer Noodles", description: "Stir-fried noodles tossed in creamy basil pesto with grilled paneer, crunchy vegetables, and herbs." },
    hi: { name: "पेस्टो पनीर नूडल्स", description: "क्रीमी बेसिल पेस्टो में टॉस किए गए स्टिर-फ्राइड नूडल्स, ग्रिल्ड पनीर, कुरकुरी सब्जियां और जड़ी-बूटियों के साथ।" },
    mr: { name: "पेस्टो पनीर नूडल्स", description: "क्रीमी बेसिल पेस्टोमध्ये टॉस केलेले स्टिर-फ्राईड नूडल्स, ग्रिल्ड पनीर, कुरकुरीत भाज्या आणि औषधी वनस्पतींसह." },
    gu: { name: "પેસ્ટો પનીર નૂડલ્સ", description: "ક્રીમી તુલસીનો છોડ પેસ્ટોમાં શેકેલા પનીર, કડક શાકભાજી અને જડીબુટ્ટીઓ સાથે સ્ટિર-ફ્રાઈડ નૂડલ્સ." }
  },
  "Bombay Sandwich": {
    en: { name: "Bombay Sandwich", description: "Grilled Mumbai-style sandwich layered with spiced potato filling, fresh cucumber, tomato, onion, mint chutney, and cheese, served with fries." },
    hi: { name: "बॉम्बे सैंडविच", description: "मसालेदार आलू की फिलिंग, ताज़ा खीरा, टमाटर, प्याज, पुदीने की चटनी और चीज़ के साथ ग्रिल्ड मुंबई-स्टाइल सैंडविच, फ्राइज़ के साथ परोसा गया।" },
    mr: { name: "बॉम्बे सँडविच", description: "मसालेदार बटाटा फिलिंग, ताजी काकडी, टोमॅटो, कांदा, पुदिन्याची चटणी आणि चीजसह ग्रिल केलेले मुंबई-स्टाईल सँडविच, फ्राईजसोबत दिले जाते." },
    gu: { name: "બોમ્બે સેન્ડવીચ", description: "મસાલેદાર બટાટા ભરણ, તાજા કાકડી, ટામેટા, ડુંગળી, ફુદીનાની ચટણી અને ચીઝ સાથે શેકેલી મુંબઈ-શૈલીની સેન્ડવીચ, ફ્રાઈસ સાથે પીરસવામાં આવે છે." }
  },
  "Mediterranean Feta Salad": {
    en: { name: "Mediterranean Feta Salad", description: "Crisp greens, kalamata olives, cucumber, cherry tomatoes, and feta cheese with a light vinaigrette." },
    hi: { name: "भूमध्यसागरीय फेटा सलाद", description: "क्रिस्प ग्रीन्स, कलामाता जैतून, खीरा, चेरी टमाटर और फेटा चीज़ के साथ हल्का विनैग्रेट।" },
    mr: { name: "मेडिटेरेनियन फेटा सॅलड", description: "क्रिस्प ग्रीन्स, कलामाटा ऑलिव्ह, काकडी, चेरी टोमॅटो आणि फेटा चीज हलक्या व्हिनॅग्रेटसह." },
    gu: { name: "ભૂમધ્ય ફેટા કચુંબર", description: "કરકરા ગ્રીન્સ, કલામાટા ઓલિવ, કાકડી, ચેરી ટામેટાં અને ફેટા ચીઝ હળવા વિનેગ્રેટ સાથે." }
  },
  "Artisan Garlic Bread": {
    en: { name: "Artisan Garlic Bread", description: "Freshly baked sourdough bread brushed with roasted garlic and herb butter." },
    hi: { name: "कारीगर गार्लिक ब्रेड", description: "ताज़ी पकी हुई खट्टी ब्रेड जिसे भुने हुए लहसुन और हर्ब बटर के साथ ब्रश किया गया है।" },
    mr: { name: "आर्टिसन गार्लिक ब्रेड", description: "ताज्या बेक केलेल्या सोरडफ ब्रेडला भाजलेला लसूण आणि हर्ब बटरने ब्रश केले जाते." },
    gu: { name: "આર્ટિસન ગार्લિક બ્રેડ", description: "તાજી શેકેલી ખાટા બ્રેડ શેકેલા લસણ અને વનસ્પતિ માખણ સાથે બ્રશ." }
  },
  "Obsidian Lava Dessert": {
    en: { name: "Obsidian Lava Dessert", description: "Molten dark chocolate cake served over a bed of edible gold crumbs and liquid nitrogen." },
    hi: { name: "ऑब्सीडियन लावा डेज़र्ट", description: "पिघला हुआ डार्क चॉकलेट केक, जो खाने योग्य सोने के टुकड़ों और तरल नाइट्रोजन के ऊपर परोसा जाता है।" },
    mr: { name: "ऑब्सिडियन लावा डेझर्ट", description: "खाद्य सोन्याच्या तुकड्यांवर आणि द्रव नायट्रोजनवर वितळलेले डार्क चॉकलेट केक दिले जाते." },
    gu: { name: "ઓબ્સિડીયન લાવા ડેઝર્ટ", description: "પીગળેલા ડાર્ક ચોકલેટ કેકને ખાદ્ય સોનાના ટુકડા અને પ્રવાહી નાઇટ્રોજનની પથારી પર પીરસવામાં આવે છે." }
  },
  "Blue Galactic Mojito": {
    en: { name: "Blue Galactic Mojito", description: "A visually striking mix of blue curaçao, mint, lime, and sparkling water." },
    hi: { name: "ब्लू गेलेक्टिक मोजिटो", description: "ब्लू कुराकाओ, पुदीना, नींबू और स्पार्कलिंग पानी का एक दृष्टिगत रूप से आकर्षक मिश्रण।" },
    mr: { name: "ब्लू गॅलेक्टिक मोजितो", description: "ब्लू कुराकाओ, पुदीना, लिंबू आणि स्पार्कलिंग वॉटर यांचे दृष्यदृष्ट्या आकर्षक मिश्रण." },
    gu: { name: "બ્લુ ગેલેક્ટીક મોજીટો", description: "વાદળી કુરાકાઓ, ફુદીનો, ચૂનો અને સ્પાર્કલિંગ પાણીનું દૃષ્ટિની આકર્ષક મિશ્રણ." }
  },
  "Chicken Tikka Skewers": {
    en: { name: "Chicken Tikka Skewers", description: "Tender chicken chunks marinated in spiced yogurt, grilled to perfection." },
    hi: { name: "चिकन टिक्का स्क्यूअर्स", description: "मसालेदार दही में मैरीनेट किए गए निविदा चिकन के टुकड़े, ग्रिल किए हुए।" },
    mr: { name: "चिकन टिक्का स्क्युअर्स", description: "मसालेदार दह्यामध्ये मॅरीनेट केलेले चिकनचे तुकडे, उत्तम प्रकारे ग्रिल केलेले." },
    gu: { name: "ચિકન ટિક્કા સ્કીવર્સ", description: "મસાલેદાર દહીંમાં મેરીનેટ કરેલા ટેન્ડર ચિકન ટુકડાઓ, સંપૂર્ણતા માટે શેકેલા." }
  }
};

const WAITER_TRANSLATIONS: Record<string, Record<string, string>> = {
  callWaiter: { en: "Call the Waiter", hi: "वेटर को बुलाएं", mr: "वेटरला बोलवा", gu: "વેઈટરને બોલાવો" },
  subtitle: { 
    en: "Please enter your table number and we will be right there to assist you.", 
    hi: "कृपया अपना टेबल नंबर दर्ज करें और हम आपकी सहायता के लिए तुरंत वहां पहुंचेंगे।", 
    mr: "कृपया तुमचा टेबल क्रमांक प्रविष्ट करा आणि आम्ही तुम्हाला मदत करण्यासाठी लगेच तिथे पोहोचू.", 
    gu: "કૃપા કરીને તમારો ટેબલ નંબર દાખલ કરો અને અમે તમને મદદ કરવા માટે તરત જ ત્યાં પહોંચીશું." 
  },
  tableNumber: { en: "Table Number", hi: "टेबल नंबर", mr: "टेबल क्रमांक", gu: "ટેબલ નંબર" },
  placeholder: { en: "e.g. 12", hi: "उदा. 12", mr: "उदा. 12", gu: "દા.ત. 12" },
  requestWaiter: { en: "Request Waiter", hi: "वेटर का अनुरोध करें", mr: "वेटरची विनंती करा", gu: "વેઈટરની વિનંતી કરો" },
  calling: { en: "Calling...", hi: "बुला रहे हैं...", mr: "बोलवत आहे...", gu: "બોલાવી રહ્યા છીએ..." },
  requestSent: { en: "Request Sent!", hi: "अनुरोध भेजा गया!", mr: "विनंती पाठवली!", gu: "વિનંતી મોકલાઈ!" },
  onWayPrefix: { en: "A waiter is on their way to ", hi: "वेटर टेबल ", mr: "वेटर टेबल ", gu: "વેઈટર ટેબલ " },
  onWaySuffix: { en: ".", hi: " की ओर आ रहा है।", mr: " कडे येत आहे.", gu: " તરફ આવી રહ્યો છે." },
  close: { en: "Close", hi: "बंद करें", mr: "बंद करा", gu: "બંધ કરો" }
};

const ORDER_TRANSLATIONS: Record<string, Record<string, string>> = {
  yourOrder: { en: "Your Order", hi: "आपका ऑर्डर", mr: "तुमची ऑर्डर", gu: "તમારો ઓર્ડર" },
  orderSummary: { en: "Order Summary", hi: "ऑर्डर सारांश", mr: "ऑर्डर सारांश", gu: "ઓર્ડર સારાંશ" },
  guestDetails: { en: "Guest Details", hi: "अतिथि विवरण", mr: "अतिथी तपशील", gu: "અતિથિ વિગતો" },
  orderConfirmed: { en: "Order Confirmed", hi: "ऑर्डर की पुष्टि", mr: "ऑर्डर निश्चित झाली", gu: "ઓર્ડર કન્ફર્મ થયો" },
  addNoteOptional: { en: "Add Note (Optional)", hi: "नोट जोड़ें (वैकल्पिक)", mr: "टीप जोडा (पर्यायी)", gu: "નોંધ ઉમેરો (વૈકલ્પિક)" },
  generalNoteOptional: { en: "General Order Note (Optional)", hi: "सामान्य ऑर्डर नोट (वैकल्पिक)", mr: "सामान्य ऑर्डर टीप (पर्यायी)", gu: "સામાન્ય ઓર્ડર નોંધ (વૈકલ્પિક)" },
  generalNotePlaceholder: { 
    en: "Example: Please serve all dishes together / less spicy / birthday table.", 
    hi: "उदाहरण: कृपया सभी व्यंजन एक साथ परोसें / कम तीखा / जन्मदिन की टेबल।", 
    mr: "उदाहरण: कृपया सर्व पदार्थ एकत्र सर्व्ह करा / कमी तिखट / वाढदिवसाचे टेबल.", 
    gu: "ઉદાહરણ: કૃપા કરીને બધી વાનગીઓ એકસાથે પીરસો / ઓછું તીખું / જન્મદિવસનું ટેબલ." 
  },
  subtotal: { en: "Subtotal", hi: "उप-योग", mr: "उप-एकूण", gu: "પેટા-કુલ" },
  gst: { en: "GST", hi: "जीएसटी", mr: "जीएसटी", gu: "જીએસટી" },
  grandTotal: { en: "Grand Total", hi: "कुल योग", mr: "एकूण रक्कम", gu: "કુલ રકમ" },
  confirmOrder: { en: "Confirm Order", hi: "ऑर्डर कन्फर्म करें", mr: "ऑर्डर कन्फर्म करा", gu: "ઓર્ડર કન્ફર્મ કરો" },
  emptyCart: { 
    en: "Your cart is empty. Add items to continue.", 
    hi: "आपका कार्ट खाली है। जारी रखने के लिए आइटम जोड़ें।", 
    mr: "तुमची कार्ट रिकामी आहे. सुरू ठेवण्यासाठी आयटम जोडा.", 
    gu: "તમારું કાર્ટ ખાલી છે. ચાલુ રાખવા માટે આઇટમ્સ ઉમેરો." 
  },
  removeItemTitle: { en: "Remove Item?", hi: "आइटम हटाएं?", mr: "आयटम काढायचा?", gu: "આઇટમ દૂર કરવી છે?" },
  removeItemText: { 
    en: "Are you sure you want to remove this item from your order?", 
    hi: "क्या आप वाकई इस आइटम को अपने ऑर्डर से हटाना चाहते हैं?", 
    mr: "तुम्हाला खात्री आहे की तुम्हाला हा आयटम तुमच्या ऑर्डरमधून काढायचा आहे?", 
    gu: "શું તમે ખરેખર આ આઇટમને તમારા ઓર્ડરમાંથી દૂર કરવા માંગો છો?" 
  },
  cancel: { en: "Cancel", hi: "रद्द करें", mr: "रद्द करा", gu: "રદ કરો" },
  remove: { en: "Remove", hi: "हटाएं", mr: "काढून टाका", gu: "દૂર કરો" }
};

const getNotePlaceholder = (name: string, lang: string) => {
  switch(lang) {
    case 'hi': return `${name} के लिए नोट`;
    case 'mr': return `${name} साठी टीप`;
    case 'gu': return `${name} માટે નોંધ`;
    default: return `Note for ${name}`;
  }
};

function generateOrderId() {
  const timestamp = Date.now().toString().slice(-6);
  return `ORD-${timestamp}`;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="relative flex items-center w-12 h-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full backdrop-blur-xl cursor-pointer transition-colors duration-500 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none"
      aria-label="Toggle theme"
    >
      <div 
        className={`absolute left-1 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
          theme === 'light' 
            ? 'translate-x-0 bg-black' 
            : 'translate-x-6 bg-white'
        }`}
      >
         <div className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-white' : 'bg-black'}`}></div>
      </div>
    </button>
  );
}

function Header({ cartCount, onCartClick, language, setLanguage }: { cartCount: number; onCartClick: () => void, language: string, setLanguage: (l: string) => void }) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    
    const handleScroll = () => {
      if (isLangOpen) {
        setIsLangOpen(false);
      }
    };

    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLangOpen]);

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-10 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md sticky top-0 z-50 transition-colors duration-500">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-black dark:text-white">The Obsidian Palace</span>
        <span className="text-black/20 dark:text-white/20">|</span>
        <span className="uppercase tracking-[0.1em] text-[8px] sm:text-[10px] text-black/60 dark:text-white/60">5D Menu</span>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative group" ref={langMenuRef}>
          <button 
             onClick={() => setIsLangOpen(!isLangOpen)}
             className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black/80 dark:text-white/80 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
             {language === 'en' ? 'EN' : language === 'mr' ? 'MR' : language === 'hi' ? 'HI' : 'GU'}
          </button>
          <div className={`absolute top-full mt-1 right-0 sm:right-2 bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-sm shadow-xl transition-all flex flex-col z-50 overflow-hidden w-28 ${
             isLangOpen ? 'opacity-100 visible' : 'opacity-0 invisible sm:group-hover:opacity-100 sm:group-hover:visible'
          }`}>
             <button onClick={() => { setLanguage('en'); setIsLangOpen(false); }} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-black dark:text-white">English</button>
             <button onClick={() => { setLanguage('mr'); setIsLangOpen(false); }} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-black dark:text-white">मराठी</button>
             <button onClick={() => { setLanguage('hi'); setIsLangOpen(false); }} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-black dark:text-white">हिंदी</button>
             <button onClick={() => { setLanguage('gu'); setIsLangOpen(false); }} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-black dark:text-white">ગુજરાતી</button>
          </div>
        </div>
        <button
          onClick={onCartClick}
          disabled={cartCount === 0}
          className={`relative group p-1 transition-opacity ${cartCount === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label="Open cart orders"
        >
           <RiBowlLine size={22} className="text-black/80 dark:text-white/80 transition-colors group-hover:text-gold" />
           {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                 {cartCount}
              </div>
           )}
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}

const MenuItem = React.memo(function MenuItem({
  item,
  layout = 'list',
  quantity,
  updateQuantity,
  onView3D,
}: {
  item: any,
  layout?: 'list' | 'grid',
  quantity: number,
  updateQuantity: (id: number, delta: number) => void,
  onView3D: (item: any) => void,
}) {
  const isGrid = layout === 'grid';
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className={`flex ${isGrid ? 'flex-col min-h-[140px]' : 'flex-row min-h-[8rem] md:min-h-[10rem] h-auto'} bg-glass rounded-sm overflow-hidden group transition-all duration-500 shadow-sm items-stretch`}>
      
      {/* ── Image (no model-viewer here → fast) ── */}
      <div className={`shrink-0 ${isGrid ? 'w-full h-48' : 'w-2/5 md:w-1/4 self-stretch min-h-[8rem] md:min-h-[10rem]'} bg-white/50 dark:bg-black/50 flex items-center justify-center relative overflow-hidden`}>
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30">{item.name}</span>
          </div>
        )}

        {/* Veg/Non-veg dot */}
        <div className="absolute top-2 right-2 z-10 bg-white/60 dark:bg-black/60 backdrop-blur border border-black/10 dark:border-white/10 p-1 md:p-1.5 rounded-sm flex items-center justify-center">
          <div className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full ${item.diet === 'Non-Veg' ? 'bg-red-600' : 'bg-green-600'}`}></div>
        </div>

        {item.modelUrl && (
          <button
            onClick={() => onView3D(item)}
            className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-black/60 dark:bg-black/70 border border-white/20 text-white/80 text-[9px] uppercase tracking-widest font-bold backdrop-blur-md hover:bg-black/80 hover:text-white transition-all duration-300 whitespace-nowrap shadow-md"
          >
            <Box className="w-3 h-3" />
            <span className="hidden sm:inline">View in </span>3D
          </button>
        )}
      </div>

      <div className={`flex flex-col justify-between ${isGrid ? 'p-5 items-center text-center w-full' : 'p-3 md:p-6 md:flex-row w-3/5 md:w-3/4'}`}>
        <div className={`space-y-1.5 flex flex-col justify-center ${isGrid ? 'mb-4 w-full' : 'mb-2 md:mb-0 md:max-w-xl md:mr-4'}`}>
          <h2 className={`font-serif italic tracking-wide text-black dark:text-white flex items-center gap-2 ${isGrid ? 'text-xl md:text-2xl justify-center' : 'text-sm md:text-2xl line-clamp-1 md:justify-start'}`}>
            {item.name}
          </h2>
          <div className="flex flex-col space-y-1.5">
             <p className={`text-[10px] md:text-sm text-black/60 dark:text-white/50 font-light leading-relaxed transition-all duration-300 ${!isExpanded ? (isGrid ? 'line-clamp-3' : 'line-clamp-2') : ''}`}>
               {item.description}
             </p>
             
             <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                   <div className="pb-1 space-y-4 pt-1 flex flex-col items-stretch">
                      <div>
                         <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2 font-bold">Ingredients</p>
                         <div className={`flex flex-wrap gap-1.5 ${isGrid ? 'justify-center' : 'justify-start'}`}>
                            {Array.isArray(item.ingredients) ? item.ingredients.map((ing: string, idx: number) => (
                               <span key={idx} className="bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-sm text-[9px] md:text-[10px] text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10">{ing}</span>
                            )) : null}
                         </div>
                      </div>
                      
                      {item.nutrition && (
                        <div>
                          <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-2 font-bold">Nutrition</p>
                          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full ${isGrid ? 'max-w-[200px] sm:max-w-[240px] mx-auto' : 'max-w-[200px] sm:max-w-[280px]'}`}>
                              {[
                                { label: 'Cal', value: item.nutrition.calories },
                                { label: 'Pro', value: item.nutrition.protein },
                                { label: 'Carbs', value: item.nutrition.carbs },
                                { label: 'Fat', value: item.nutrition.fat }
                              ].map((nut, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-1.5 border border-black/5 dark:bg-white/5 bg-black/5 dark:bg-white/5 rounded-sm">
                                    <span className="text-[8px] text-black/40 dark:text-white/40 uppercase tracking-wider mb-0.5">{nut.label}</span>
                                    <span className="text-[10px] md:text-[11px] font-bold text-black/80 dark:text-white/80">{nut.value || '-'}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gold hover:text-amber-500 transition-colors w-max py-0.5 ${isGrid ? 'mx-auto mt-2' : 'self-start mt-1'}`}
             >
                {isExpanded ? '- Less Info' : '+ More Info'}
             </button>
          </div>
        </div>
        <div className={`flex items-center justify-between shrink-0 w-full transition-all duration-500 ${isGrid ? 'flex-row mt-2' : 'flex-row md:flex-col md:w-[100px] md:items-end mt-auto md:mt-0 self-stretch md:py-1'}`}>
          {!isGrid && <div className={`hidden md:block transition-[flex-grow,height] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full ${isExpanded ? 'flex-[0.0001] h-0' : 'flex-[1]'}`}></div>}
          
          <span className={`font-serif text-[15px] md:text-xl text-gold shrink-0 z-10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isGrid ? 'mb-0' : `mr-1 ${isExpanded ? 'mb-0 md:mb-0' : 'mb-0 md:mb-2'}`}`}>{item.price}</span>
          
          {!isGrid && <div className={`hidden md:block transition-[flex-grow,height] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full shrink-0 ${isExpanded ? 'flex-[1]' : 'flex-[0.0001] h-2'}`}></div>}

          <div className="shrink-0 z-10 flex flex-col items-end">
             {quantity > 0 ? (
               <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm h-7 md:h-8">
                  <button onClick={() => updateQuantity(item.id, -1)} className="px-2.5 h-full hover:text-gold transition-colors text-black dark:text-white rounded-sm cursor-pointer flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10">
                     <Minus size={12} strokeWidth={3} />
                  </button>
                  <span className="text-[11px] md:text-xs font-bold text-black dark:text-white w-5 text-center">{quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="px-2.5 h-full hover:text-gold transition-colors text-black dark:text-white rounded-sm cursor-pointer flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10">
                     <Plus size={12} strokeWidth={3} />
                  </button>
               </div>
             ) : (
               <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="px-6 py-1.5 md:py-2 bg-black/80 dark:bg-black/50 backdrop-blur-md border border-black dark:border-white/20 text-white rounded-sm text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] hover:text-gold transition-colors shadow-sm cursor-pointer"
               >
                 ADD
               </button>
             )}
          </div>
          
          {!isGrid && <div className={`hidden md:block transition-[flex-grow,height] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full ${isExpanded ? 'flex-[0.0001] h-0' : 'flex-[1]'}`}></div>}
        </div>
      </div>
    </article>
  );
});

function Footer() {
  return (
    <footer className="w-full bg-glass-light dark:bg-glass border-t border-black/5 dark:border-white/5 mt-16 px-6 sm:px-10 py-12 flex flex-col md:flex-row justify-between gap-10 md:gap-0">
      
      <div className="flex flex-col space-y-6 md:w-1/3">
        <div>
          <p className="font-serif italic text-xl text-black dark:text-white">The Obsidian Palace</p>
          <p className="text-[8px] uppercase tracking-[0.4em] text-black/40 dark:text-white/20 mt-1">Excellence Refined</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] uppercase tracking-widest text-black/50 dark:text-white/30">Address</p>
          <p className="text-[10px] font-light text-black dark:text-white">102 Luxury Row, Metropolis</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] uppercase tracking-widest text-black/50 dark:text-white/30">Inquiries</p>
          <a href="mailto:concierge@obsidianpalace.com" className="text-[10px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">concierge@obsidianpalace.com</a>
        </div>
      </div>

      <div className="flex flex-col space-y-2 md:w-1/3 md:items-center">
        <div className="flex flex-col space-y-3 w-fit">
          <p className="text-[8px] uppercase tracking-widest text-black/50 dark:text-white/30 mb-1">Explore</p>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">View Food Menu</a>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">About Us</a>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">Reservations & Bookings</a>
        </div>
      </div>

      <div className="flex flex-col space-y-2 md:w-1/3 md:items-end">
        <div className="flex flex-col space-y-3 w-fit md:text-right">
          <p className="text-[8px] uppercase tracking-widest text-black/50 dark:text-white/30 mb-1">Connect</p>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">Instagram</a>
          <a href="#" className="text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">Facebook</a>
          <div className="pt-2">
            <a href="#" className="flex items-center gap-1.5 text-[11px] font-light text-black dark:text-white hover:text-amber-700 dark:hover:text-gold transition-colors">
              <span className="text-[10px]">★</span>
               Google Reviews
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default function SmartMenuPage() {
  const { data: dbMenuItems = [] } = useSWR("menuItems", getMenuItems);
  const { data: dbSettings } = useSWR("settings", getSettings);

  const ALL_MENU_ITEMS = useMemo(() => [...MENU_ITEMS, ...dbMenuItems], [dbMenuItems]);
  
  const currentGstRate = dbSettings?.gstRate ?? 5;

  const [isSubmitting, setIsSubmitting] = useState(false);

  type ConfirmedOrder = {
    id: string;
    customerName: string;
    tableNumber: string;
    contactNumber?: string;
    createdAt: string;
    total: number; 
    generalNote?: string;
    items: Array<{ id: number; name: string; quantity: number; price: number; note?: string }>;
  };

  const [fallbackItem, setFallbackItem] = useState<any>(null);

  // Pre-warm the heavy model-viewer library in the background
  // so it opens instantly when requested.
  useEffect(() => {
    const timer = setTimeout(() => {
      import("@google/model-viewer").catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [viewer3DItem, setViewer3DItem] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [language, setLanguage] = useState<string>('en');
  
  // ✅ Waiter Modal States
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [waiterStep, setWaiterStep] = useState<'form' | 'success'>('form');
  const [tableNumber, setTableNumber] = useState('');
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  
  const [cart, setCart] = useState<Record<number, number>>({});
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStep, setOrderStep] = useState<'summary' | 'details' | 'confirmed'>('summary');
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderTableNumber, setOrderTableNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [generalOrderNote, setGeneralOrderNote] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<number, string>>({});
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<ConfirmedOrder[]>([]);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (isOrderModalOpen || isWaiterModalOpen || itemToDelete !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOrderModalOpen, isWaiterModalOpen, itemToDelete]);
  
  const cartCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);
  


  const updateQuantity = useCallback((itemId: number, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const updated = current + delta;

      if (updated <= 0) {
        setItemToDelete(itemId);
        return prev;
      } else {
        const newCart = { ...prev, [itemId]: updated };
        return newCart;
      }
    });
  }, []);

  const confirmDelete = useCallback(() => {
    if (itemToDelete !== null) {
      setCart(prev => {
        const newCart = { ...prev };
        delete newCart[itemToDelete];
        return newCart;
      });
      setItemToDelete(null);
    }
  }, [itemToDelete]);

  const cancelDelete = useCallback(() => {
    setItemToDelete(null);
  }, []);

  const openOrderModal = () => {
    if (cartCount === 0) return;
    setIsOrderModalOpen(true);
    setOrderStep('summary');
    setIsEditingOrder(false);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setOrderStep('summary');
    setIsEditingOrder(false);
  };

  const confirmOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    const orderId = generateOrderId();
    
    const orderData = {
      id: orderId,
      guestName: customerName.trim(), 
      tableNumber: orderTableNumber.trim(),
      contactNumber: contactNumber.trim() || null,
      generalNote: generalOrderNote.trim() || null,
      total: cartGrandTotal,
      status: "active" as const,
    };

    const dbItemsData = cartItems.map((item) => ({
      menuItemId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.numericPrice,
      note: itemNotes[item.id]?.trim() || null,
    }));

    const response = await submitOrder(orderData, dbItemsData);

    if (response.success) {
      const finalOrderId = response.orderId || orderId;
      setLatestOrderId(finalOrderId);
      
      const newHistoryItem: ConfirmedOrder = {
        id: finalOrderId,
        customerName: customerName.trim(),
        tableNumber: orderTableNumber.trim(),
        contactNumber: contactNumber.trim() || undefined,
        createdAt: new Date().toISOString(),
        total: cartGrandTotal,
        generalNote: generalOrderNote.trim() || undefined,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.numericPrice,
          note: itemNotes[item.id]?.trim() || undefined,
        })),
      };

      setOrderHistory((prev) => [newHistoryItem, ...prev]);
      
      setCart({});
      setCustomerName('');
      setOrderTableNumber('');
      setContactNumber('');
      setGeneralOrderNote('');
      setItemNotes({});
      setOrderStep('confirmed');
      setIsEditingOrder(false);
    } else {
      alert("Failed to place order. Please try again.");
    }
    setIsSubmitting(false);
  };

  const closeWaiterModal = () => {
    setIsWaiterModalOpen(false);
    setTimeout(() => {
      setTableNumber('');
      setWaiterStep('form');
    }, 300); // Give time for transition
  };

  // ✅ Updated to call createServiceRequest instead of createWaiterRequest
  const handleCallWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber) return;
    
    setIsCallingWaiter(true);
    try {
      await createServiceRequest(Number(tableNumber)); // ✅ FIXED
      setWaiterStep('success'); 
    } catch (error) {
      console.error(error);
      alert("Failed to call waiter. Please try again.");
    } finally {
      setIsCallingWaiter(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = language === 'en' ? 'en-US' : language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'gu-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript.replace(/\.$/, ''));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const localizedItems = useMemo(() => {
     return ALL_MENU_ITEMS.map(item => {
        const trans = TRANSLATIONS[item.name]?.[language];
        if (trans) {
           return { ...item, name: trans.name, description: trans.description };
        }
        return item;
     });
  }, [ALL_MENU_ITEMS, language]);

  const cartItems = useMemo(
    () =>
      localizedItems.filter((item) => (cart[item.id] || 0) > 0).map((item) => ({
        ...item,
        quantity: cart[item.id],
        numericPrice: Number(item.price.replace(/[^\d]/g, '')) || 0,
      })),
    [localizedItems, cart]
  );
  
  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0),
    [cartItems]
  );
  const gstAmount = useMemo(() => Math.round(cartSubtotal * (currentGstRate / 100)), [cartSubtotal, currentGstRate]);
  const cartGrandTotal = useMemo(() => cartSubtotal + gstAmount, [cartSubtotal, gstAmount]);

  const filteredItems = useMemo(
    () =>
      localizedItems.filter(item => {
        const matchCategory = activeCategory === 'All' || item.category === activeCategory;
        const query = searchQuery.toLowerCase();
        const matchSearch =
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          (Array.isArray(item.ingredients) &&
            item.ingredients.some((ing: string) => ing.toLowerCase().includes(query)));
        const matchDiet = dietFilter === 'All' || item.diet === dietFilter;
        return matchCategory && matchSearch && matchDiet;
      }),
    [localizedItems, activeCategory, searchQuery, dietFilter]
  );

  const suggestedQuery = useMemo(() => {
    if (filteredItems.length > 0 || !searchQuery) return null;
    let closestSuggestion: string | null = null;
    let minDistance = Infinity;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return null;
    
    // Check full item names first
    for (const item of localizedItems) {
      const name = item.name.toLowerCase();
      if (name.includes(query) || query.includes(name)) return item.name;
      
      const distance = levenshtein(query, name);
      if (distance < minDistance && distance <= Math.max(3, name.length * 0.4)) {
        minDistance = distance;
        closestSuggestion = item.name;
      }
    }

    // Check individual words in both name and description
    for (const item of localizedItems) {
      const textToSearch = `${item.name} ${item.description}`.toLowerCase();
      const words = textToSearch.split(/[\s,.-]+/);
      for (const w of words) {
         if (w.length < 3) continue; // Allow short words like 'veg' and 'sup'
         const d = levenshtein(query, w);
         // More lenient threshold for typos
         const threshold = Math.max(3, Math.ceil(w.length * 0.5));
         if (d < minDistance && d <= threshold) {
            minDistance = d;
            closestSuggestion = w;
         }
      }
    }
    return closestSuggestion;
  }, [filteredItems.length, searchQuery, localizedItems]);

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen relative">
        {/* DishViewer full-screen 3D modal */}
        {viewer3DItem && (
          <DishViewer
            item={viewer3DItem}
            resolveModelUrl={resolveModelUrl}
            onClose={() => setViewer3DItem(null)}
            quantity={cart[viewer3DItem.id] || 0}
            updateQuantity={updateQuantity}
          />
        )}

        <Header cartCount={cartCount} onCartClick={openOrderModal} language={language} setLanguage={setLanguage} />
        
        <section className="w-full bg-white/30 dark:bg-black/30 backdrop-blur-md border-b border-black/5 dark:border-white/5 sticky top-16 z-40">
          <div className="w-full px-4 sm:px-10">
            <div className="flex overflow-x-auto py-4 gap-1.5 md:gap-2.5 no-scrollbar items-center">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`group flex items-center gap-2 md:gap-2.5 px-1.5 py-1.5 pr-4 md:pr-5 rounded-sm whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border ${
                      isActive 
                        ? 'bg-gradient-to-r from-gold/20 to-gold/5 dark:from-gold/30 dark:to-gold/5 border-gold/40 shadow-[0_2px_10px_-2px_rgba(197,160,89,0.25)] md:-translate-y-[1px]' 
                        : 'bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/5 text-black/60 dark:text-white/60 hover:bg-white/60 dark:hover:bg-white/10 hover:border-black/5 dark:hover:border-white/10 md:hover:-translate-y-[1px] hover:shadow-sm'
                    }`}
                  >
                    <div className={`p-1.5 md:p-2 rounded-sm transition-colors duration-500 flex items-center justify-center ${
                        isActive 
                          ? 'bg-gold text-white shadow-sm shadow-black/10' 
                          : 'bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 group-hover:bg-black/10 dark:group-hover:bg-white/20 group-hover:text-gold'
                    }`}>
                        <Icon size={14} className="md:w-4 md:h-4 w-3.5 h-3.5" strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] md:text-xs font-bold tracking-widest uppercase transition-colors duration-300 ${
                       isActive ? 'text-amber-900 dark:text-amber-100' : 'text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white'
                    }`}>
                        {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="w-full pt-6 pb-2 z-30">
          <div className="w-full px-4 sm:px-10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:flex-1 shrink flex items-center">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 z-10" size={16} />
              <input 
                type="text" 
                placeholder="Search menu or ingredients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-glass border border-black/10 dark:border-white/10 rounded-full pl-10 pr-20 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 z-10">
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 rounded-full text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    title="Clear Text"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
                <button 
                  onClick={startVoiceSearch}
                  className={`p-1.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md' : 'text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gold cursor-pointer'}`}
                  title="Search by Voice"
                >
                   <Mic size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
              
              <div className="relative flex w-[180px] sm:w-[240px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full p-1 shadow-sm overflow-hidden">
                <div 
                   className={`absolute top-1 bottom-1 w-[calc(33.333%-2.66px)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
                      dietFilter === 'All' ? 'translate-x-[0px] bg-black dark:bg-white' :
                      dietFilter === 'Veg' ? 'translate-x-[100%] bg-green-600' :
                      'translate-x-[200%] bg-red-600'
                   }`}
                />
                
                {(['All', 'Veg', 'Non-Veg'] as const).map(diet => (
                  <button
                    key={diet}
                    onClick={() => setDietFilter(diet)}
                    className={`relative z-10 flex-1 py-1 sm:py-1.5 text-[9px] sm:text-xs font-bold tracking-wide uppercase transition-colors duration-300 ${
                      dietFilter === diet 
                        ? (diet === 'All' ? 'text-white dark:text-black' : 'text-white')
                        : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>

              <div className="relative flex w-[72px] sm:w-[88px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full p-1 shadow-sm overflow-hidden">
                <div 
                   className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-black dark:bg-white transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
                      viewLayout === 'list' ? 'translate-x-[0px]' : 'translate-x-[100%]'
                   }`}
                />
                <button
                  onClick={() => setViewLayout('list')}
                  className={`relative z-10 flex-1 flex items-center justify-center py-1 sm:py-1.5 transition-colors duration-300 ${viewLayout === 'list' ? 'text-white dark:text-black' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
                  title="List View"
                >
                  <ListIcon size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`relative z-10 flex-1 flex items-center justify-center py-1 sm:py-1.5 transition-colors duration-300 ${viewLayout === 'grid' ? 'text-white dark:text-black' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
                  title="Grid View"
                >
                  <LayoutGrid size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
        
        <main className={`flex-1 px-4 sm:px-10 py-6 w-full ${viewLayout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' : 'flex flex-col gap-4'}`}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                layout={viewLayout}
                quantity={cart[item.id] || 0}
                updateQuantity={updateQuantity}
                onView3D={setViewer3DItem}
              />
            ))
          ) : (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center opacity-50 col-span-full">
               <Search size={48} className="mb-4 text-black dark:text-white opacity-20" />
               <p className="text-lg font-serif italic text-black dark:text-white">No items match your search.</p>
               {suggestedQuery && (
                  <div className="mt-4 pointer-events-auto">
                     <p className="text-sm text-black/60 dark:text-white/60 mb-2">Did you mean?</p>
                     <button 
                        onClick={() => setSearchQuery(suggestedQuery)}
                        className="text-base sm:text-lg font-serif italic text-gold hover:text-amber-500 transition-colors border-b border-gold/30 pb-0.5 cursor-pointer"
                     >
                        {suggestedQuery}
                     </button>
                  </div>
               )}
               <button 
                  onClick={() => { setSearchQuery(""); setDietFilter("All"); setActiveCategory("All"); }}
                  className="mt-6 text-[10px] uppercase font-bold tracking-widest text-black/50 dark:text-white/50 text-center hover:text-black dark:hover:text-white transition pointer-events-auto cursor-pointer"
               >
                 Clear Search
               </button>
            </div>
          )}
        </main>

        <Footer />
      </div>

      <button
        onClick={() => setIsWaiterModalOpen(true)}
        className={`group fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] flex items-center justify-center p-3 sm:p-4 rounded-full border whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
          bg-gold/20 dark:bg-gold/10 border-gold/30 dark:border-gold/20 hover:bg-gold/30 dark:hover:bg-gold/20 hover:border-gold/50 dark:hover:border-gold/40 hover:-translate-y-1 hover:shadow-[0_4px_15px_-3px_rgba(197,160,89,0.3)] backdrop-blur-md cursor-pointer`}
      >
        <div className="rounded-sm transition-colors duration-500 flex items-center justify-center text-amber-900/80 dark:text-gold/80 group-hover:text-amber-950 dark:group-hover:text-gold">
          <User size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
        </div>
      </button>

      {/* ✅ Waiter Modal with Success Step */}
      {isWaiterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-6 rounded-2xl shadow-2xl relative">
            <button 
              onClick={closeWaiterModal} 
              className="absolute top-4 right-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {waiterStep === 'form' ? (
              <>
                <div className="flex flex-col items-center text-center space-y-4 mb-6 mt-2">
                   <div className="p-3 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gold">
                       <User size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-serif italic text-black dark:text-white">{WAITER_TRANSLATIONS.callWaiter[language] || WAITER_TRANSLATIONS.callWaiter.en}</h3>
                     <p className="text-xs text-black/50 dark:text-white/50 font-light mt-1 w-4/5 mx-auto">
                        {WAITER_TRANSLATIONS.subtitle[language] || WAITER_TRANSLATIONS.subtitle.en}
                     </p>
                   </div>
                </div>

                <form onSubmit={handleCallWaiter}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5 ml-1">
                         {WAITER_TRANSLATIONS.tableNumber[language] || WAITER_TRANSLATIONS.tableNumber.en}
                      </label>
                      <input
                        type="number"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        required
                        min="1"
                        className="no-spinners w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold text-black dark:text-white transition-colors placeholder:text-black/30 dark:placeholder:text-white/30"
                        placeholder={WAITER_TRANSLATIONS.placeholder[language] || WAITER_TRANSLATIONS.placeholder.en}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isCallingWaiter}
                      className="w-full bg-gold/90 hover:bg-gold text-white font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs py-3.5 rounded-xl transition-all shadow-md cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCallingWaiter 
                        ? (WAITER_TRANSLATIONS.calling[language] || WAITER_TRANSLATIONS.calling.en) 
                        : (WAITER_TRANSLATIONS.requestWaiter[language] || WAITER_TRANSLATIONS.requestWaiter.en)}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center space-y-4 my-6">
                <div className="p-4 rounded-full bg-green-500/10 text-green-500 animate-in zoom-in duration-300">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-serif italic text-black dark:text-white">{WAITER_TRANSLATIONS.requestSent[language] || WAITER_TRANSLATIONS.requestSent.en}</h3>
                  <p className="text-sm text-black/60 dark:text-white/60 font-light mt-2">
                    {WAITER_TRANSLATIONS.onWayPrefix[language] || WAITER_TRANSLATIONS.onWayPrefix.en}
                    <strong className="text-gold">{language === 'en' ? `Table ${tableNumber}` : tableNumber}</strong>
                    {WAITER_TRANSLATIONS.onWaySuffix[language] || WAITER_TRANSLATIONS.onWaySuffix.en}
                  </p>
                </div>
                <button
                  onClick={closeWaiterModal}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer mt-6"
                >
                  {WAITER_TRANSLATIONS.close[language] || WAITER_TRANSLATIONS.close.en}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {itemToDelete !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-serif italic text-black dark:text-white mb-2">
              {ORDER_TRANSLATIONS.removeItemTitle[language] || ORDER_TRANSLATIONS.removeItemTitle.en}
            </h3>
            <p className="text-sm text-black/60 dark:text-white/60 mb-6">
              {ORDER_TRANSLATIONS.removeItemText[language] || ORDER_TRANSLATIONS.removeItemText.en}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={cancelDelete} 
                className="flex-1 py-3 rounded-xl border border-black/10 dark:border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                {ORDER_TRANSLATIONS.cancel[language] || ORDER_TRANSLATIONS.cancel.en}
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                {ORDER_TRANSLATIONS.remove[language] || ORDER_TRANSLATIONS.remove.en}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-4 sm:p-6 rounded-2xl shadow-2xl relative">
            
            {isSubmitting && (
              <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-md rounded-2xl">
                <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4 shadow-lg"></div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold animate-pulse">Sending to Kitchen...</p>
              </div>
            )}

            <button
              onClick={closeOrderModal}
              className="absolute top-4 right-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer z-50"
            >
              <X size={18} />
            </button>

            <div className="pr-8">
              <h3 className="text-xl sm:text-2xl font-serif italic text-black dark:text-white">{ORDER_TRANSLATIONS.yourOrder[language] || ORDER_TRANSLATIONS.yourOrder.en}</h3>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mt-1">
                {orderStep === 'summary'
                  ? (ORDER_TRANSLATIONS.orderSummary[language] || ORDER_TRANSLATIONS.orderSummary.en)
                  : orderStep === 'details'
                    ? (ORDER_TRANSLATIONS.guestDetails[language] || ORDER_TRANSLATIONS.guestDetails.en)
                    : (ORDER_TRANSLATIONS.orderConfirmed[language] || ORDER_TRANSLATIONS.orderConfirmed.en)}
              </p>
            </div>

            {orderStep === 'summary' && (
              <div className="mt-6 space-y-5">
                {cartItems.length > 0 ? (
                  <>
                    <div className="space-y-2.5">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-xl p-3 sm:p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm sm:text-base font-semibold text-black dark:text-white">{item.name}</p>
                              <p className="text-[11px] sm:text-xs text-black/55 dark:text-white/55">
                                {item.price} {language === 'mr' ? 'प्रत्येक' : language === 'hi' ? 'प्रत्येक' : language === 'gu' ? 'દરેક' : 'each'}
                              </p>
                            </div>
                              <div className="flex items-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-sm h-8 shrink-0">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="px-2.5 h-full hover:text-gold transition-colors text-black dark:text-white flex items-center justify-center cursor-pointer"
                                >
                                  <Minus size={12} strokeWidth={3} />
                                </button>
                                <span className="text-[11px] md:text-xs font-bold text-black dark:text-white w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="px-2.5 h-full hover:text-gold transition-colors text-black dark:text-white flex items-center justify-center cursor-pointer"
                                >
                                  <Plus size={12} strokeWidth={3} />
                                </button>
                              </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-[0.18em] text-black/45 dark:text-white/45 mb-1.5">
                              {ORDER_TRANSLATIONS.addNoteOptional[language] || ORDER_TRANSLATIONS.addNoteOptional.en}
                            </label>
                            <input
                              type="text"
                              value={itemNotes[item.id] || ''}
                              onChange={(e) => setItemNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              className="w-full bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2 px-3 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                              placeholder={getNotePlaceholder(item.name, language)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-xl p-3 sm:p-4">
                      <label className="block text-[10px] uppercase tracking-[0.18em] text-black/45 dark:text-white/45 mb-1.5">
                        {ORDER_TRANSLATIONS.generalNoteOptional[language] || ORDER_TRANSLATIONS.generalNoteOptional.en}
                      </label>
                      <textarea
                        value={generalOrderNote}
                        onChange={(e) => setGeneralOrderNote(e.target.value)}
                        rows={3}
                        className="w-full resize-none bg-white/40 dark:bg-white/5 border border-black/10 dark:border-white/10 py-2.5 px-3 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                        placeholder={ORDER_TRANSLATIONS.generalNotePlaceholder[language] || ORDER_TRANSLATIONS.generalNotePlaceholder.en}
                      />
                    </div>

                    <div className="space-y-2 border-t border-black/10 dark:border-white/10 pt-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-black/55 dark:text-white/55">{ORDER_TRANSLATIONS.subtotal[language] || ORDER_TRANSLATIONS.subtotal.en}</p>
                        <p className="text-sm font-serif text-black dark:text-white">₹{cartSubtotal}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-black/55 dark:text-white/55">{ORDER_TRANSLATIONS.gst[language] || ORDER_TRANSLATIONS.gst.en} ({currentGstRate}%)</p>
                        <p className="text-sm font-serif text-black dark:text-white">₹{gstAmount}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                        <p className="text-xs uppercase tracking-[0.2em] text-black/80 dark:text-white/80 font-bold">{ORDER_TRANSLATIONS.grandTotal[language] || ORDER_TRANSLATIONS.grandTotal.en}</p>
                        <p className="text-lg sm:text-xl font-serif text-gold font-bold">₹{cartGrandTotal}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      <button
                        onClick={() => setOrderStep('details')}
                        className="w-full sm:flex-1 bg-gold/90 hover:bg-gold text-white font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        {ORDER_TRANSLATIONS.confirmOrder[language] || ORDER_TRANSLATIONS.confirmOrder.en}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-black/55 dark:text-white/55 text-sm">
                    {ORDER_TRANSLATIONS.emptyCart[language] || ORDER_TRANSLATIONS.emptyCart.en}
                  </div>
                )}
              </div>
            )}

            {orderStep === 'details' && (
              <form onSubmit={confirmOrder} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5 ml-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                    placeholder="Guest name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5 ml-1">
                    Table Number
                  </label>
                  <input
                    type="number"
                    value={orderTableNumber}
                    onChange={(e) => setOrderTableNumber(e.target.value)}
                    required
                    min="1"
                    className="no-spinners w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                    placeholder="e.g. 12"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 mb-1.5 ml-1">
                    Number (If you want to recieve bill on WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none focus:border-gold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                    placeholder="Phone number"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setOrderStep('summary')}
                    className="w-full sm:w-auto px-6 py-2.5 border border-black/15 dark:border-white/15 rounded-xl text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-black/70 dark:text-white/70"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 bg-gold/90 hover:bg-gold text-white font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            )}

            {orderStep === 'confirmed' && (
              <div className="mt-6 space-y-5">
                <div className="border border-gold/35 bg-gold/10 rounded-xl p-4 sm:p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/50 dark:text-white/50">Order ID</p>
                  <p className="text-2xl sm:text-3xl font-serif text-gold mt-1">{latestOrderId}</p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50 mb-2.5">
                    Order History
                  </p>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {orderHistory.map((order, index) => {
                      const histSubtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
                      const histGst = Math.round(histSubtotal * (currentGstRate / 100));

                      return (
                        <div
                          key={`${order.id}-${index}`}
                          className="border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-xl p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-black dark:text-white">{order.id}</p>
                              <p className="text-[11px] text-black/55 dark:text-white/55">
                                {order.customerName} | Table {order.tableNumber}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-black/55 dark:text-white/55">Subtotal: ₹{histSubtotal}</p>
                              <p className="text-[10px] text-black/55 dark:text-white/55 mb-0.5">GST: ₹{histGst}</p>
                              <p className="text-sm font-serif text-gold font-bold">Total: ₹{order.total}</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-black/50 dark:text-white/50 mt-1">
                            {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          
                          <p className="text-[11px] text-black/70 dark:text-white/70 mt-1.5 leading-relaxed font-medium">
                            {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                          </p>

                          {order.generalNote ? (
                            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1.5">Note: {order.generalNote}</p>
                          ) : null}
                          
                          {order.items.some((item) => item.note) ? (
                            <div className="mt-1.5 space-y-1">
                              {order.items
                                .filter((item) => item.note)
                                .map((item) => (
                                  <p key={`${order.id}-${item.id}`} className="text-[11px] text-black/60 dark:text-white/60">
                                    {item.name}: {item.note}
                                  </p>
                                ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={closeOrderModal}
                  className="w-full bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {fallbackItem && (
        <DishViewer
          item={fallbackItem}
          resolveModelUrl={resolveModelUrl}
          onClose={() => setFallbackItem(null)}
          quantity={cart[fallbackItem.id] || 0}
          updateQuantity={updateQuantity}
        />
      )}
    </ThemeProvider>
  );
}
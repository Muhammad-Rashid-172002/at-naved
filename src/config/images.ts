/**
 * FOOD PHOTOGRAPHY REGISTRY — the single place to change any food image on the site.
 *
 * Every photo is a real food photograph from Unsplash (https://unsplash.com/license — free for
 * commercial use, no permission needed). Each entry stores the Unsplash photo id.
 *
 * How an image is resolved (see `resolveImage`):
 *   1. "photo:<key>"            → local file from `photo-manifest.json` if you ran `npm run images:localize`,
 *                                 otherwise served from Unsplash's CDN (auto WebP/AVIF, resized per device).
 *   2. Legacy "/images/food/*.svg" values (older databases) → mapped to a matching photo automatically.
 *   3. Anything else (Supabase uploads, absolute URLs, /public paths) → used as is.
 *
 * To swap a photo: change the `id` below (the part after unsplash.com/photos/… → "photo-…" in the image URL),
 * or upload your own photo from Admin → Menu.
 */
import manifest from "./photo-manifest.json";

export interface FoodPhoto {
  /** Unsplash image id, e.g. "photo-1568901346375-23c9450c58cd" */
  id: string;
  alt: string;
  /** CSS object-position for better crops */
  position?: string;
}

export const foodPhotos = {
  // Hero & showcase
  "hero-burger": { id: "photo-1632203171982-cc0df6e9ceb4", alt: "Stacked burger with every layer floating in the air", position: "50% 45%" },
  "burger-dark": { id: "photo-1508736793122-f516e3ba5569", alt: "Cheeseburger on a dark slate board" },
  "burger-fries": { id: "photo-1551782450-a2132b4ba21d", alt: "Burger with a basket of fries" },
  "burger-moody": { id: "photo-1600688640154-9619e002df30", alt: "Double cheeseburger and fries on a dark plate", position: "50% 30%" },
  "pizza-cheese-pull": { id: "photo-1541745537411-b8046dc6d66c", alt: "Pizza slice with a long cheese pull" },
  "wings-glazed": { id: "photo-1650939986300-ce9609921fa7", alt: "Glazed chicken wings" },

  // Burgers
  "classic-zinger": { id: "photo-1671106571674-a89083d27e60", alt: "Crispy zinger chicken burger" },
  "cheese-burger": { id: "photo-1655895176036-bf1a11326e5c", alt: "Cheeseburger on a wooden board" },
  "double-decker": { id: "photo-1637710847214-f91d99669e18", alt: "Fried chicken sandwich stacked high" },
  "crispy-chicken-burger": { id: "photo-1645024679624-e8351ac98f01", alt: "Crispy chicken burger with lettuce" },
  "double-beef-burger": { id: "photo-1572802419224-296b0aeee0d9", alt: "Double beef burger with melted cheese", position: "50% 60%" },
  "special-loaded-burger": { id: "photo-1599155253646-7989e08c05c1", alt: "Loaded double burger with bacon and cheese" },

  // Pizza
  "chicken-tikka-pizza": { id: "photo-1665033628673-7de125eb6b12", alt: "Chicken tikka pizza" },
  "fajita-pizza": { id: "photo-1552539618-7eec9b4d1796", alt: "Chicken fajita pizza with peppers" },
  "pepperoni-pizza": { id: "photo-1777891257674-36c5532e6654", alt: "Pepperoni pizza" },
  "cheese-lovers-pizza": { id: "photo-1732223229355-95a1433404bf", alt: "Extra cheese pizza" },
  "special-pizza": { id: "photo-1621070766841-a7bf1ee96df0", alt: "Loaded special pizza" },

  // Shawarma
  "chicken-shawarma": { id: "photo-1662116765994-1e4200c43589", alt: "Chicken shawarma wrap cut in half" },
  "zinger-shawarma": { id: "photo-1719282431565-3b30bb7d2658", alt: "Crispy chicken shawarma roll" },
  "cheese-shawarma": { id: "photo-1676300187013-7540d4e9440d", alt: "Cheese shawarma with garlic sauce" },
  "special-shawarma": { id: "photo-1670164745513-f4fd1684d780", alt: "Shawarma platter with salad and sauces" },

  // Fried chicken
  "chicken-wings": { id: "photo-1608039755401-742074f0548d", alt: "Crispy chicken wings" },
  "fried-chicken": { id: "photo-1569058242253-92a9c755a0ec", alt: "Golden fried chicken pieces" },
  "chicken-strips": { id: "photo-1619019187211-adf2f6119afd", alt: "Crispy chicken strips with dips" },
  "chicken-nuggets": { id: "photo-1627662168223-7df99068099a", alt: "Chicken nuggets" },
  "chicken-bucket": { id: "photo-1588923930978-3f8c78001ec5", alt: "Bucket of fried chicken" },

  // Fries & sides
  "regular-fries": { id: "photo-1630384060421-cb20d0e0649d", alt: "French fries in a basket" },
  "masala-fries": { id: "photo-1541592106381-b31e9677c0e5", alt: "Seasoned masala fries" },
  "loaded-fries": { id: "photo-1666304752980-678d5c35c911", alt: "Loaded fries with toppings" },
  "cheese-fries": { id: "photo-1573080496219-bb080dd4f877", alt: "Fries with melted cheese" },
  coleslaw: { id: "photo-1573403707491-38a4ea19edc1", alt: "Creamy coleslaw" },
  "garlic-mayo": { id: "photo-1678651535326-0aa4d7e4c0d4", alt: "Garlic mayo dip" },

  // Drinks
  "cold-drink": { id: "photo-1629654613528-5d0a2e4166de", alt: "Iced cola in a glass" },
  "fresh-juice": { id: "photo-1600271886742-f049cd451bba", alt: "Fresh orange juice" },
  milkshake: { id: "photo-1553787499-6f9133860278", alt: "Chocolate milkshake with whipped cream", position: "50% 40%" },
  "mint-margarita": { id: "photo-1653542772393-71ffa417b1c4", alt: "Mint margarita with lemon" },
  "mineral-water": { id: "photo-1523362628745-0c100150b504", alt: "Bottle of mineral water" },

  // Deals
  "deal-zinger-combo": { id: "photo-1638860238433-4879f3b08331", alt: "Burger, fries and drink combo" },
  "deal-student": { id: "photo-1734988353291-9ac67fa5997b", alt: "Burger and fries meal" },
  "deal-shawarma-duo": { id: "photo-1777199298385-07e46ccc2004", alt: "Shawarma plate with fries" },
  "deal-family-feast": { id: "photo-1644447381290-85358ae625cb", alt: "Family fast food spread" },
} satisfies Record<string, FoodPhoto>;

export type PhotoKey = keyof typeof foodPhotos;

/** Category cover photos */
export const categoryPhotos: Record<string, PhotoKey> = {
  burgers: "burger-dark",
  pizza: "pepperoni-pizza",
  shawarma: "chicken-shawarma",
  "fried-chicken": "fried-chicken",
  "fries-sides": "loaded-fries",
  drinks: "milkshake",
  deals: "deal-zinger-combo",
};

/** Old illustration paths → a matching photo, so existing databases upgrade without re-seeding. */
const legacyMap: Record<string, PhotoKey> = {
  "/images/food/burger.svg": "classic-zinger",
  "/images/food/pizza.svg": "chicken-tikka-pizza",
  "/images/food/shawarma.svg": "chicken-shawarma",
  "/images/food/fried-chicken.svg": "fried-chicken",
  "/images/food/nuggets.svg": "chicken-nuggets",
  "/images/food/fries.svg": "regular-fries",
  "/images/food/drink.svg": "cold-drink",
  "/images/food/shake.svg": "milkshake",
  "/images/food/deal.svg": "deal-zinger-combo",
};

const local = manifest as Record<string, string>;
const UNSPLASH = "https://images.unsplash.com/";

export const photo = (key: PhotoKey) => `photo:${key}`;

export interface ResolvedImage {
  src: string;
  /** true → image is on Unsplash's CDN and should use the Unsplash loader */
  remote: boolean;
  position?: string;
  alt?: string;
}

export function resolveImage(src: string | null | undefined, fallback: PhotoKey = "classic-zinger"): ResolvedImage {
  let key: PhotoKey | undefined;
  if (!src) key = fallback;
  else if (src.startsWith("photo:")) key = (src.slice(6) in foodPhotos ? src.slice(6) : fallback) as PhotoKey;
  else if (legacyMap[src]) key = legacyMap[src];
  if (!key) return { src: src as string, remote: false };
  const p: FoodPhoto = foodPhotos[key];
  if (local[key]) return { src: local[key], remote: false, position: p.position, alt: p.alt };
  return { src: UNSPLASH + p.id, remote: true, position: p.position, alt: p.alt };
}

/** Product-aware resolution: legacy illustrations become the product's own photo when one exists. */
const productPhotoById: Record<string, PhotoKey> = {
  "classic-zinger": "classic-zinger",
  "zinger-cheese": "cheese-burger",
  "double-decker": "double-decker",
  "chicken-patty": "crispy-chicken-burger",
  "beef-smash": "double-beef-burger",
  "tower-burger": "special-loaded-burger",
  "chicken-tikka-pizza": "chicken-tikka-pizza",
  "chicken-fajita-pizza": "fajita-pizza",
  "malai-boti-pizza": "pepperoni-pizza",
  "crown-crust-pizza": "special-pizza",
  "veggie-pizza": "cheese-lovers-pizza",
  "chicken-shawarma": "chicken-shawarma",
  "zinger-shawarma": "zinger-shawarma",
  "cheese-shawarma": "cheese-shawarma",
  "shawarma-platter": "special-shawarma",
  "crispy-chicken-2pc": "fried-chicken",
  "chicken-bucket": "chicken-bucket",
  "hot-wings": "chicken-wings",
  "chicken-nuggets": "chicken-nuggets",
  "chicken-strips": "chicken-strips",
  "regular-fries": "regular-fries",
  "masala-fries": "masala-fries",
  "loaded-fries": "loaded-fries",
  "cheese-fries": "cheese-fries",
  coleslaw: "coleslaw",
  "garlic-mayo-dip": "garlic-mayo",
  "soft-drink": "cold-drink",
  "mint-margarita": "mint-margarita",
  "chocolate-shake": "milkshake",
  "fresh-juice": "fresh-juice",
  "mineral-water": "mineral-water",
  "deal-zinger-combo": "deal-zinger-combo",
  "deal-student": "deal-student",
  "deal-shawarma-duo": "deal-shawarma-duo",
  "deal-family-feast": "deal-family-feast",
};

export function imageFor(entity: { id: string; image: string }): string {
  if ((!entity.image || legacyMap[entity.image]) && (productPhotoById[entity.id] || categoryPhotos[entity.id])) {
    return photo(productPhotoById[entity.id] ?? categoryPhotos[entity.id]);
  }
  return entity.image;
}

export const DEFAULT_FOOD_IMAGE = photo("classic-zinger");
export const HERO_IMAGE = photo("hero-burger");

/** Shown in Admin → image picker */
export const imagePresets: { label: string; src: string }[] = (Object.keys(foodPhotos) as PhotoKey[]).map((k) => ({
  label: k.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
  src: photo(k),
}));

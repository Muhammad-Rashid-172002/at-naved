/**
 * Extra presentation details per product (shown on the product page and quick view).
 * Not stored in the database, so editing this never affects orders. Products without an entry
 * still work — ingredients are simply hidden.
 */
export interface ProductExtras {
  ingredients: string[];
  /** Short label such as "Spicy", "Bestseller", "New" */
  tag?: string;
}

export const productExtras: Record<string, ProductExtras> = {
  "classic-zinger": { ingredients: ["Hand-breaded chicken fillet", "Iceberg lettuce", "Signature mayo", "Toasted sesame bun"], tag: "Bestseller" },
  "zinger-cheese": { ingredients: ["Zinger fillet", "Double cheddar", "Pickles", "House chilli sauce", "Sesame bun"] },
  "double-decker": { ingredients: ["Two crispy fillets", "Double cheese", "Jalapeños", "Smoky sauce", "Brioche bun"], tag: "Spicy" },
  "chicken-patty": { ingredients: ["Crumbed chicken breast", "Iceberg", "Tomato", "Garlic mayo", "Brioche bun"] },
  "beef-smash": { ingredients: ["Two smashed beef patties", "Double cheddar", "Caramelised onions", "Burger sauce"], tag: "Chef's pick" },
  "tower-burger": { ingredients: ["Zinger fillet", "Beef patty", "Hash brown", "Cheese", "Jalapeños", "Smoky sauce"], tag: "Loaded" },
  "chicken-tikka-pizza": { ingredients: ["Smoky tikka chicken", "Onion", "Capsicum", "Mozzarella", "Hand-stretched base"], tag: "Bestseller" },
  "chicken-fajita-pizza": { ingredients: ["Fajita chicken", "Capsicum", "Onion", "Olives", "Mozzarella"] },
  "malai-boti-pizza": { ingredients: ["Chicken pepperoni", "Tomato sauce", "Mozzarella", "Oregano"] },
  "crown-crust-pizza": { ingredients: ["Cheese-stuffed crown crust", "Tikka & fajita chicken", "Olives", "Peppers", "Mozzarella"], tag: "Signature" },
  "veggie-pizza": { ingredients: ["Mozzarella", "Cheddar", "Parmesan", "Garlic-butter base"] },
  "chicken-shawarma": { ingredients: ["Spiced chicken", "Garlic sauce", "Pickles", "Salad", "Fresh pita"], tag: "Bestseller" },
  "zinger-shawarma": { ingredients: ["Crispy zinger strips", "Spicy mayo", "Lettuce", "Pickles", "Arabic bread"], tag: "Spicy" },
  "cheese-shawarma": { ingredients: ["Chicken shawarma", "Melted cheese", "Garlic sauce", "Pickles", "Arabic bread"] },
  "shawarma-platter": { ingredients: ["Sliced shawarma", "Rice", "Fries", "Salad", "Garlic sauce", "Pita"] },
  "crispy-chicken-2pc": { ingredients: ["Overnight-marinated chicken", "Double breading", "House spice blend"] },
  "chicken-bucket": { ingredients: ["9 pieces fried chicken", "House spice blend"], tag: "Share" },
  "hot-wings": { ingredients: ["Chicken wings", "House hot sauce", "Cooling dip"], tag: "Spicy" },
  "chicken-nuggets": { ingredients: ["Chicken breast nuggets", "Crispy crumb", "Dip of your choice"] },
  "chicken-strips": { ingredients: ["Chicken breast strips", "Hand breading", "Dip of your choice"], tag: "New" },
  "regular-fries": { ingredients: ["Potatoes", "Sea salt"] },
  "masala-fries": { ingredients: ["Potatoes", "Chaat masala", "Chilli flakes"] },
  "loaded-fries": { ingredients: ["Fries", "Cheese sauce", "Crispy chicken", "Jalapeños", "Spicy mayo"], tag: "Bestseller" },
  "cheese-fries": { ingredients: ["Fries", "Warm cheese sauce", "Herbs"], tag: "New" },
  coleslaw: { ingredients: ["Cabbage", "Carrot", "Creamy dressing"] },
  "garlic-mayo-dip": { ingredients: ["Mayo", "Roasted garlic", "Herbs"] },
  "soft-drink": { ingredients: ["Chilled soft drink", "Ice on request"] },
  "mint-margarita": { ingredients: ["Fresh mint", "Lemon", "Crushed ice"] },
  "chocolate-shake": { ingredients: ["Milk", "Ice cream", "Whipped cream", "Your choice of flavour"] },
  "fresh-juice": { ingredients: ["Fresh seasonal fruit", "No added colour"], tag: "Fresh" },
  "mineral-water": { ingredients: ["500 ml bottled water"] },
  "deal-zinger-combo": { ingredients: ["Classic Zinger", "Regular fries", "345 ml drink"], tag: "Best value" },
  "deal-student": { ingredients: ["Crispy Chicken Burger", "Regular fries", "345 ml drink"] },
  "deal-shawarma-duo": { ingredients: ["2 Chicken Shawarmas", "Regular fries", "2 × 345 ml drinks"] },
  "deal-family-feast": { ingredients: ["Medium pizza", "4 pcs fried chicken", "2 Zinger burgers", "Large fries", "1.5 L drink"], tag: "Family" },
};

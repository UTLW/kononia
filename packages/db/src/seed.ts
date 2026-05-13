import { db } from "./index";
import { seasons, fastDays, meals, mealIngredients, mealSteps, mealTags, snacks } from "./schema";
import { eq } from "drizzle-orm";

const COPTIC_MONTHS = [
  "Tout", "Baba", "Hator", "Kiahk", "Toba", "Amshir",
  "Baramhat", "Baramouda", "Pashons", "Paoni", "Epip",
  "Mesra", "Mesori", "Pi Kogi Enavot"
];

const generateId = () => crypto.randomUUID();

async function seedSeasons() {
  const seasonsData = [
    {
      id: "nativity_fast_2025",
      name: "Nativity Fast",
      description: "Forty-day fast preparing for the Nativity of Christ",
      startDate: "2025-11-15",
      endDate: "2025-12-24",
      fastingType: "regular",
      strictRules: JSON.stringify(["No meat", "No dairy", "No eggs", "No wine", "No oil on Mondays, Wednesdays, Fridays"]),
      regularRules: JSON.stringify(["No meat", "No dairy", "Wine and oil allowed except Mon/Wed/Fri"]),
      year: 2025,
      copticMonth: "Kiahk",
      copticStartDay: 4,
    },
    {
      id: "great_lent_2026",
      name: "Great Lent",
      description: "Fifty-five day fast preparing for Holy Easter",
      startDate: "2026-02-23",
      endDate: "2026-04-19",
      fastingType: "strict",
      strictRules: JSON.stringify(["No meat", "No dairy", "No eggs", "No wine", "No oil", "No fish"]),
      regularRules: JSON.stringify(["No meat", "No dairy", "Wine and oil allowed on weekends"]),
      year: 2026,
      copticMonth: "Amshir",
      copticStartDay: 6,
    },
    {
      id: "apostles_fast_2026",
      name: "Apostles Fast",
      description: "Fast in preparation for the feast of St. Peter and St. Paul",
      startDate: "2026-06-08",
      endDate: "2026-06-28",
      fastingType: "regular",
      strictRules: JSON.stringify(["No meat", "No dairy", "No wine", "No oil on Mon/Wed/Fri"]),
      regularRules: JSON.stringify(["No meat", "No dairy"]),
      year: 2026,
      copticMonth: "Paoni",
      copticStartDay: 10,
    },
    {
      id: "dormition_fast_2026",
      name: "Dormition Fast",
      description: "Fifteen-day fast before the feast of the Dormition of the Theotokos",
      startDate: "2026-08-01",
      endDate: "2026-08-14",
      fastingType: "strict",
      strictRules: JSON.stringify(["No meat", "No dairy", "No wine", "No oil"]),
      regularRules: JSON.stringify(["No meat", "No dairy", "Wine and oil allowed"]),
      year: 2026,
      copticMonth: "Mesra",
      copticStartDay: 21,
    },
  ];

  for (const season of seasonsData) {
    await db.insert(seasons).values(season).onConflictDoNothing();
  }
  console.log("Seasons seeded");
}

async function seedFastDays() {
  const today = new Date().toISOString().split("T")[0];
  
  const fastDaysData = [
    { date: "2025-11-15", seasonId: "nativity_fast_2025", fastingType: "regular", fastNotes: "Start of Nativity Fast" },
    { date: "2025-11-16", seasonId: "nativity_fast_2025", fastingType: "regular" },
    { date: "2025-11-17", seasonId: "nativity_fast_2025", fastingType: "regular", fastNotes: "St. Mark the Evangelist" },
    { date: "2025-11-18", seasonId: "nativity_fast_2025", fastingType: "regular" },
    { date: "2025-11-19", seasonId: "nativity_fast_2025", fastingType: "regular" },
    { date: "2025-11-20", seasonId: "nativity_fast_2025", fastingType: "regular" },
    { date: "2025-11-21", seasonId: "nativity_fast_2025", fastingType: "regular", fastNotes: "Feast of the Presentation of the Theotokos" },
    { date: "2025-12-24", seasonId: "nativity_fast_2025", fastingType: "strict", fastNotes: "Christmas Eve" },
    { date: "2025-12-25", seasonId: "nativity_fast_2025", fastingType: "feast", fastNotes: "Nativity of Christ" },
    { date: "2025-12-26", seasonId: "nativity_fast_2025", fastingType: "feast", fastNotes: "St. Stephen's Day" },
    { date: "2026-01-06", seasonId: "nativity_fast_2025", fastingType: "feast", fastNotes: "Epiphany" },
    { date: "2026-02-23", seasonId: "great_lent_2026", fastingType: "strict", fastNotes: "Clean Monday - Start of Great Lent" },
    { date: "2026-02-24", seasonId: "great_lent_2026", fastingType: "strict" },
    { date: "2026-03-01", seasonId: "great_lent_2026", fastingType: "strict", fastNotes: "St. Athanasius & Cyril of Alexandria" },
    { date: "2026-03-08", seasonId: "great_lent_2026", fastingType: "strict", fastNotes: "St. John of the Ladder" },
    { date: "2026-04-12", seasonId: "great_lent_2026", fastingType: "strict", fastNotes: "Palm Sunday" },
    { date: "2026-04-17", seasonId: "great_lent_2026", fastingType: "strict", fastNotes: "Good Friday" },
    { date: "2026-04-18", seasonId: "great_lent_2026", fastingType: "strict", fastNotes: "Holy Saturday" },
    { date: "2026-04-19", seasonId: "great_lent_2026", fastingType: "feast", fastNotes: "Pascha (Easter)" },
  ];

  for (const day of fastDaysData) {
    await db.insert(fastDays).values({
      ...day,
      id: generateId(),
      isToday: day.date === today,
    }).onConflictDoNothing();
  }
  console.log("Fast days seeded");
}

async function seedMeals() {
  const mealsData = [
    {
      id: generateId(),
      name: "Koshari",
      cuisine: "egyptian",
      fastingType: "both",
      description: "Egyptian national dish with rice, lentils, pasta, and tomato sauce",
      prepTime: 20,
      cookTime: 45,
      servings: 6,
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
      cuisineTag: "🇪🇬 Egyptian",
    },
    {
      id: generateId(),
      name: "Ful Medames",
      cuisine: "egyptian",
      fastingType: "strict",
      description: "Slow-cooked fava beans with olive oil and spices",
      prepTime: 10,
      cookTime: 180,
      servings: 4,
      imageUrl: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=800",
      cuisineTag: "🇪🇬 Egyptian",
    },
    {
      id: generateId(),
      name: "Shakshuka",
      cuisine: "middle-eastern",
      fastingType: "regular",
      description: "Eggs poached in spiced tomato sauce",
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      imageUrl: "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800",
      cuisineTag: "🇹🇳 Middle Eastern",
    },
    {
      id: generateId(),
      name: "Falafel Wrap",
      cuisine: "lebanese",
      fastingType: "strict",
      description: "Crispy chickpea fritters in pita with tahini",
      prepTime: 30,
      cookTime: 15,
      servings: 4,
      imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
      cuisineTag: "🇱🇧 Lebanese",
    },
    {
      id: generateId(),
      name: "Pasta Pomodoro",
      cuisine: "italian",
      fastingType: "strict",
      description: "Simple pasta with fresh tomato and basil",
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
      cuisineTag: "🇮🇹 Italian",
    },
    {
      id: generateId(),
      name: "Vegetable Stir Fry",
      cuisine: "chinese",
      fastingType: "strict",
      description: "Quick fried vegetables with soy and ginger",
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800",
      cuisineTag: "🇨🇳 Chinese",
    },
    {
      id: generateId(),
      name: "Black Bean Tacos",
      cuisine: "mexican",
      fastingType: "strict",
      description: "Spiced black beans with avocado and salsa",
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800",
      cuisineTag: "🇲🇽 Mexican",
    },
    {
      id: generateId(),
      name: "Mediterranean Salad",
      cuisine: "greek",
      fastingType: "regular",
      description: "Fresh vegetables with olives and lemon dressing",
      prepTime: 15,
      cookTime: 0,
      servings: 4,
      imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
      cuisineTag: "🇬🇷 Greek",
    },
  ];

  for (const meal of mealsData) {
    await db.insert(meals).values(meal).onConflictDoNothing();
  }
  console.log("Meals seeded");

  const ingredientData = [
    { mealId: mealsData[0].id, ingredients: ["2 cups rice", "1 cup lentils", "1 cup pasta", "2 cups tomato sauce", "1 can chickpeas", "1 onion", "3 cloves garlic", "1 tsp cumin"] },
    { mealId: mealsData[1].id, ingredients: ["2 lbs fava beans", "4 cloves garlic", "1/2 cup olive oil", "1 tsp cumin", "Salt and pepper", "Fresh parsley", "Lemon juice"] },
    { mealId: mealsData[2].id, ingredients: ["4 eggs", "2 cans diced tomatoes", "1 onion", "3 cloves garlic", "1 tsp paprika", "1 tsp cumin", "Fresh cilantro", "Salt and pepper"] },
    { mealId: mealsData[3].id, ingredients: ["2 cups chickpeas", "1 onion", "3 cloves garlic", "1/2 cup parsley", "1 tsp cumin", "1/2 tsp coriander", "Pita bread", "Tahini sauce"] },
    { mealId: mealsData[4].id, ingredients: ["1 lb spaghetti", "4 ripe tomatoes", "4 cloves garlic", "Fresh basil", "1/4 cup olive oil", "Salt and pepper", "Red pepper flakes"] },
    { mealId: mealsData[5].id, ingredients: ["2 cups mixed vegetables", "2 tbsp soy sauce", "1 tbsp sesame oil", "2 cloves garlic", "1 inch ginger", "1 tbsp cornstarch"] },
    { mealId: mealsData[6].id, ingredients: ["2 cans black beans", "8 corn tortillas", "1 avocado", "1 cup salsa", "1 lime", "1 tsp cumin", "1/2 tsp smoked paprika"] },
    { mealId: mealsData[7].id, ingredients: ["2 cucumbers", "4 tomatoes", "1 red onion", "1/2 cup kalamata olives", "1/2 cup feta cheese", "3 tbsp olive oil", "1 lemon", "Dried oregano"] },
  ];

  for (const meal of ingredientData) {
    const mealDb = await db.select().from(meals).where(eq(meals.name, mealsData.find(m => m.id === meal.mealId)?.name || "")).limit(1);
    if (mealDb[0]) {
      for (let i = 0; i < meal.ingredients.length; i++) {
        await db.insert(mealIngredients).values({
          id: generateId(),
          mealId: mealDb[0].id,
          ingredient: meal.ingredients[i],
          orderIndex: i,
        }).onConflictDoNothing();
      }
    }
  }
  console.log("Ingredients seeded");

  const stepData = [
    { mealId: mealsData[0].id, steps: ["Cook rice according to package", "Cook lentils until tender", "Cook pasta until al dente", "Sauté onion and garlic", "Add tomato sauce and simmer", "Combine all components and serve"] },
    { mealId: mealsData[1].id, steps: ["Soak beans overnight", "Add beans and water to pot", "Cook on low for 3 hours", "Sauté garlic in olive oil", "Add spices and combine", "Garnish with parsley and lemon"] },
    { mealId: mealsData[2].id, steps: ["Sauté onion and garlic", "Add tomatoes and spices", "Simmer for 10 minutes", "Create wells and crack eggs", "Cover and cook until set", "Garnish with cilantro"] },
  ];

  for (const meal of stepData) {
    const mealDb = await db.select().from(meals).where(eq(meals.name, mealsData.find(m => m.id === meal.mealId)?.name || "")).limit(1);
    if (mealDb[0]) {
      for (let i = 0; i < meal.steps.length; i++) {
        await db.insert(mealSteps).values({
          id: generateId(),
          mealId: mealDb[0].id,
          stepNumber: i + 1,
          instruction: meal.steps[i],
        }).onConflictDoNothing();
      }
    }
  }
  console.log("Steps seeded");

  const tagData = [
    { mealId: mealsData[0].id, tags: ["comfort-food", "family-friendly"] },
    { mealId: mealsData[1].id, tags: ["high-protein", "traditional"] },
    { mealId: mealsData[2].id, tags: ["quick", "breakfast"] },
    { mealId: mealsData[3].id, tags: ["street-food", "high-protein"] },
    { mealId: mealsData[4].id, tags: ["quick", "kid-friendly"] },
    { mealId: mealsData[5].id, tags: ["quick", "healthy"] },
    { mealId: mealsData[6].id, tags: ["family-friendly", "quick"] },
    { mealId: mealsData[7].id, tags: ["healthy", "light"] },
  ];

  for (const meal of tagData) {
    const mealDb = await db.select().from(meals).where(eq(meals.name, mealsData.find(m => m.id === meal.mealId)?.name || "")).limit(1);
    if (mealDb[0]) {
      for (const tag of meal.tags) {
        await db.insert(mealTags).values({
          id: generateId(),
          mealId: mealDb[0].id,
          tag,
        }).onConflictDoNothing();
      }
    }
  }
  console.log("Tags seeded");
}

async function seedSnacks() {
  const snacksData = [
    { name: "Hummus with Pita", cuisine: "lebanese", fastingType: "strict", description: "Creamy chickpea dip with warm pita", imageUrl: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800" },
    { name: "Tabbouleh", cuisine: "lebanese", fastingType: "strict", description: "Parsley salad with bulgur and tomatoes", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800" },
    { name: "Baba Ganoush", cuisine: "middle-eastern", fastingType: "strict", description: "Roasted eggplant dip", imageUrl: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=800" },
    { name: "Fresh Fruit", cuisine: "american", fastingType: "both", description: "Seasonal fresh fruits", imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800" },
    { name: "Olives & Pickles", cuisine: "greek", fastingType: "strict", description: "Mixed olives and pickled vegetables", imageUrl: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=800" },
    { name: "Rice Cakes with Tahini", cuisine: "middle-eastern", fastingType: "strict", description: "Crispy rice cakes with sesame paste", imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800" },
  ];

  for (const snack of snacksData) {
    await db.insert(snacks).values({
      ...snack,
      id: generateId(),
    }).onConflictDoNothing();
  }
  console.log("Snacks seeded");
}

async function main() {
  console.log("Starting seed...");
  await seedSeasons();
  await seedFastDays();
  await seedMeals();
  await seedSnacks();
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
import {
  DailyRecommendationSet,
  DayOfWeek,
  DietType,
  IngredientItem,
  MealCategory,
  PreferredTime,
  Recipe,
  ShoppingListItem,
  UserPreferences,
} from '../types';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as unknown as DayOfWeek[];

export function getDayNameFromDateString(dateStr: string): DayOfWeek {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const names: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return names[dt.getDay()] || 'Monday';
}

export function getTodayDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isDietCompatible(recipeDiet: DietType, userDiet: DietType): boolean {
  if (userDiet === 'Non-vegetarian') {
    return true;
  }
  if (userDiet === 'Eggetarian') {
    return recipeDiet === 'Vegetarian' || recipeDiet === 'Vegan' || recipeDiet === 'Eggetarian';
  }
  if (userDiet === 'Vegetarian') {
    return recipeDiet === 'Vegetarian' || recipeDiet === 'Vegan';
  }
  if (userDiet === 'Vegan') {
    return recipeDiet === 'Vegan';
  }
  return true;
}

export function hasAllergenConflict(recipeAllergens: string[], userAllergies: string[]): boolean {
  if (!userAllergies.length || !recipeAllergens.length) return false;
  const normalizedUser = userAllergies.map((a) => a.trim().toLowerCase());
  return recipeAllergens.some((ra) => normalizedUser.includes(ra.trim().toLowerCase()));
}

function getMaxPreferredMinutes(pref: PreferredTime): number {
  switch (pref) {
    case 'Under 20 minutes':
      return 20;
    case 'Under 30 minutes':
      return 30;
    case '30–45 minutes':
      return 45;
    default:
      return 999;
  }
}

export function buildPreferenceSignature(prefs: UserPreferences): string {
  return [
    prefs.foodPreference,
    prefs.favouriteCuisine,
    prefs.spicePreference,
    prefs.cookingExperience,
    prefs.preferredCookingTime,
    prefs.mealStyle,
    [...prefs.allergies].sort().join(','),
    [...prefs.favouriteDishes].sort().join(','),
  ].join('|');
}

export function scoreRecipeForPreferences(
  recipe: Recipe,
  prefs: UserPreferences,
  previouslySuggestedIds: string[] = []
): number {
  let score = 50;

  // Regional match
  if (prefs.favouriteCuisine !== 'All Regions' && recipe.region === prefs.favouriteCuisine) {
    score += 24;
  }

  // Spice match
  if (recipe.spiceLevel === prefs.spicePreference) {
    score += 16;
  } else if (
    (prefs.spicePreference === 'Mild' && recipe.spiceLevel === 'Spicy') ||
    (prefs.spicePreference === 'Spicy' && recipe.spiceLevel === 'Mild')
  ) {
    score -= 10;
  }

  // Time match
  const maxMins = getMaxPreferredMinutes(prefs.preferredCookingTime);
  if (recipe.totalTimeMinutes <= maxMins) {
    score += 18;
  } else {
    score -= Math.min(20, Math.floor((recipe.totalTimeMinutes - maxMins) / 3));
  }

  // Cooking experience alignment
  if (prefs.cookingExperience === 'Beginner') {
    if (recipe.difficulty === 'Easy' || recipe.isBeginnerFriendly) score += 20;
    if (recipe.difficulty === 'Advanced') score -= 18;
  } else if (prefs.cookingExperience === 'Intermediate') {
    if (recipe.difficulty === 'Medium' || recipe.difficulty === 'Easy') score += 10;
  } else if (prefs.cookingExperience === 'Advanced') {
    if (recipe.difficulty === 'Advanced' || recipe.isTraditional) score += 14;
  }

  // Meal style alignment
  if (prefs.mealStyle === 'Quick meals' && recipe.totalTimeMinutes <= 25) {
    score += 14;
  } else if (prefs.mealStyle === 'Traditional meals' && recipe.isTraditional) {
    score += 14;
  }

  // Favourite dish keyword boost
  if (prefs.favouriteDishes.length > 0) {
    const titleLower = `${recipe.title} ${recipe.hindiName}`.toLowerCase();
    for (const fav of prefs.favouriteDishes) {
      const token = fav.trim().toLowerCase();
      if (token && titleLower.includes(token)) {
        score += 15;
      }
    }
  }

  // Penalize recently suggested dishes on previous days to ensure variety
  if (previouslySuggestedIds.includes(recipe.id)) {
    score -= 22;
  }

  return score;
}

function deterministicHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function getEligibleCandidatesForSlot(
  recipes: Recipe[],
  slot: Extract<MealCategory, 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>,
  prefs: UserPreferences
): Recipe[] {
  // Strict filter: meal slot + diet + allergies
  const strict = recipes.filter(
    (r) =>
      r.mealCategories.includes(slot) &&
      isDietCompatible(r.diet, prefs.foodPreference) &&
      !hasAllergenConflict(r.allergens, prefs.allergies)
  );
  if (strict.length > 0) return strict;

  // Fallback 1: relax meal slot while strictly keeping diet & allergy safety
  const safeAnySlot = recipes.filter(
    (r) =>
      isDietCompatible(r.diet, prefs.foodPreference) &&
      !hasAllergenConflict(r.allergens, prefs.allergies)
  );
  if (safeAnySlot.length > 0) return safeAnySlot;

  // Fallback 2: diet-safe
  const dietSafe = recipes.filter((r) => isDietCompatible(r.diet, prefs.foodPreference));
  return dietSafe.length > 0 ? dietSafe : recipes;
}

export function generateDailyRecommendations(
  recipes: Recipe[],
  dateStr: string,
  prefs: UserPreferences,
  previouslySuggestedIds: string[] = [],
  surpriseSeed: number = 0
): DailyRecommendationSet {
  const dayName = getDayNameFromDateString(dateStr);
  const chosenToday = new Set<string>();

  const pickSlot = (slot: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'): string => {
    const candidates = getEligibleCandidatesForSlot(recipes, slot, prefs).filter(
      (r) => !chosenToday.has(r.id)
    );
    const pool = candidates.length > 0 ? candidates : getEligibleCandidatesForSlot(recipes, slot, prefs);

    // Score each candidate and add a deterministic day-specific tie-breaker/rotation
    // so Monday, Tuesday, Wednesday, etc. naturally rotate among top-fitting Indian meals
    const ranked = pool
      .map((recipe) => {
        const baseScore = scoreRecipeForPreferences(recipe, prefs, previouslySuggestedIds);
        const dayRotationNoise =
          deterministicHash(`${dateStr}:${dayName}:${slot}:${recipe.id}:${surpriseSeed}`) % 28;
        return {
          recipe,
          finalScore: baseScore + dayRotationNoise,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);

    const winner = ranked[0]?.recipe || recipes[0];
    if (winner) chosenToday.add(winner.id);
    return winner ? winner.id : '';
  };

  const breakfastId = pickSlot('Breakfast');
  const lunchId = pickSlot('Lunch');
  const snacksId = pickSlot('Snacks');
  const dinnerId = pickSlot('Dinner');

  return {
    date: dateStr,
    dayName,
    breakfastId,
    lunchId,
    snacksId,
    dinnerId,
    preferenceSignature: buildPreferenceSignature(prefs),
    surpriseSeed,
  };
}

export function getAlternativeRecipeForSlot(
  recipes: Recipe[],
  slot: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner',
  prefs: UserPreferences,
  currentRecipeId: string,
  excludeIds: string[] = []
): Recipe | undefined {
  const candidates = getEligibleCandidatesForSlot(recipes, slot, prefs)
    .map((r) => ({
      recipe: r,
      score: scoreRecipeForPreferences(r, prefs),
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.recipe);

  const withoutActiveMeals = candidates.filter(
    (r) => r.id !== currentRecipeId && !excludeIds.includes(r.id)
  );
  if (withoutActiveMeals.length > 0) {
    const currentIdx = candidates.findIndex((r) => r.id === currentRecipeId);
    const nextIdx = (currentIdx + 1) % candidates.length;
    const candidate = candidates[nextIdx];
    if (candidate && candidate.id !== currentRecipeId && !excludeIds.includes(candidate.id)) {
      return candidate;
    }
    return withoutActiveMeals[0];
  }

  return candidates.find((r) => r.id !== currentRecipeId) || candidates[0];
}

export interface IngredientMatchResult {
  recipe: Recipe;
  matchedIngredients: string[];
  missingIngredients: IngredientItem[];
  matchPercentage: number;
}

const PANTRY_STAPLES = new Set([
  'water',
  'salt',
  'cooking oil',
  'oil',
  'vegetable oil',
  'black pepper',
]);

function normalizeIngredientToken(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchRecipesByIngredients(
  recipes: Recipe[],
  availableIngredients: string[],
  dietFilter?: DietType | 'All'
): IngredientMatchResult[] {
  const userTokens = availableIngredients
    .map(normalizeIngredientToken)
    .filter((t) => t.length > 0);

  if (userTokens.length === 0) return [];

  return recipes
    .filter((r) => !dietFilter || dietFilter === 'All' || isDietCompatible(r.diet, dietFilter))
    .map((recipe) => {
      const matched: string[] = [];
      const missing: IngredientItem[] = [];

      for (const ing of recipe.ingredients) {
        const normIng = normalizeIngredientToken(ing.name);
        if (PANTRY_STAPLES.has(normIng)) {
          continue;
        }
        const isHit = userTokens.some(
          (ut) => normIng.includes(ut) || ut.includes(normIng)
        );
        if (isHit) {
          matched.push(ing.name);
        } else {
          missing.push(ing);
        }
      }

      const totalCore = matched.length + missing.length;
      const matchPercentage =
        totalCore > 0 ? Math.round((matched.length / totalCore) * 100) : 0;

      return {
        recipe,
        matchedIngredients: matched,
        missingIngredients: missing,
        matchPercentage,
      };
    })
    .filter((res) => res.matchedIngredients.length > 0)
    .sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return b.matchedIngredients.length - a.matchedIngredients.length;
    });
}

export function scaleIngredientAmount(amountStr: string, baseServings: number, targetServings: number): string {
  if (!baseServings || baseServings === targetServings) return amountStr;
  const ratio = targetServings / baseServings;

  // Match leading integer, decimal, or simple fraction (e.g., "1.5 cups", "1/2 tsp", "200 g")
  const fractionMatch = amountStr.match(/^(\d+)\/(\d+)(\s+.*)?$/);
  if (fractionMatch) {
    const val = (Number(fractionMatch[1]) / Number(fractionMatch[2])) * ratio;
    const formatted = Number.isInteger(val) ? String(val) : val.toFixed(2).replace(/\.?0+$/, '');
    return `${formatted}${fractionMatch[3] || ''}`;
  }

  const numMatch = amountStr.match(/^(\d+(?:\.\d+)?)(\s*.*)$/);
  if (numMatch) {
    const val = Number(numMatch[1]) * ratio;
    const formatted = Number.isInteger(val) ? String(val) : val.toFixed(1).replace(/\.0$/, '');
    return `${formatted}${numMatch[2] || ''}`;
  }

  return amountStr;
}

export function mergeIngredientsIntoShoppingList(
  existing: ShoppingListItem[],
  incoming: { item: IngredientItem; recipeTitle?: string }[]
): ShoppingListItem[] {
  const next = [...existing];

  for (const { item, recipeTitle } of incoming) {
    const norm = normalizeIngredientToken(item.name);
    if (PANTRY_STAPLES.has(norm)) continue;

    const existingIdx = next.findIndex(
      (s) => !s.checked && normalizeIngredientToken(s.name) === norm
    );

    if (existingIdx >= 0) {
      const current = next[existingIdx];
      if (!current.amount.includes(item.amount)) {
        next[existingIdx] = {
          ...current,
          amount: `${current.amount} + ${item.amount}`,
        };
      }
    } else {
      next.push({
        id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: item.name,
        amount: item.amount,
        category: item.category,
        checked: false,
        sourceRecipeTitle: recipeTitle,
      });
    }
  }

  return next;
}

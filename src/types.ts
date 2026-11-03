export type PageId =
  | 'home'
  | 'explore'
  | 'todays-food'
  | 'recipe-details'
  | 'learn-cooking'
  | 'ai-chef'
  | 'ingredient-finder'
  | 'favourites'
  | 'meal-planner'
  | 'shopping-list'
  | 'cooking-history'
  | 'dashboard'
  | 'profile'
  | 'settings'
  | 'login'
  | 'register';

export type IndianRegion =
  | 'North Indian'
  | 'South Indian'
  | 'East Indian'
  | 'West Indian'
  | 'Central Indian'
  | 'Northeast Indian';

export type DietType = 'Vegetarian' | 'Non-vegetarian' | 'Vegan' | 'Eggetarian';

export type MealCategory = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner' | 'Dessert';

export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy';

export type Difficulty = 'Easy' | 'Medium' | 'Advanced';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type MealStyle = 'Quick meals' | 'Traditional meals';

export type PreferredTime = 'Under 20 minutes' | 'Under 30 minutes' | '30–45 minutes' | 'Any duration';

export type GroceryCategory =
  | 'Produce & Herbs'
  | 'Dairy & Protein'
  | 'Spices & Masalas'
  | 'Grains, Lentils & Oils';

export interface IngredientItem {
  name: string;
  amount: string;
  category: GroceryCategory;
}

export interface InstructionStep {
  step: number;
  title: string;
  detail: string;
  timerMinutes?: number;
}

export interface RecipeReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export type DishVisualStyle =
  | 'photo-butter-paneer'
  | 'photo-palak-paneer'
  | 'photo-veg-pulao'
  | 'photo-rogan-josh'
  | 'photo-paneer-tikka'
  | 'photo-dal-makhani'
  | 'poha'
  | 'dosa'
  | 'idli'
  | 'dal-rice'
  | 'samosa'
  | 'dhokla'
  | 'rajma-rice'
  | 'biryani'
  | 'chilla'
  | 'paneer-sandwich'
  | 'khichdi'
  | 'chole-bhature'
  | 'fish-curry'
  | 'thukpa-momo'
  | 'litti-chokha'
  | 'gulab-jamun'
  | 'egg-bhurji'
  | 'misal-pav';

export interface Recipe {
  id: string;
  title: string;
  hindiName: string;
  description: string;
  region: IndianRegion;
  mealCategories: MealCategory[];
  diet: DietType;
  spiceLevel: SpiceLevel;
  difficulty: Difficulty;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  isPopular?: boolean;
  isBeginnerFriendly?: boolean;
  isTraditional?: boolean;
  allergens: string[];
  ingredients: IngredientItem[];
  instructions: InstructionStep[];
  tips: string;
  rating: number;
  reviewCount: number;
  reviews: RecipeReview[];
  visualStyle: DishVisualStyle;
}

export interface CookingLesson {
  id: string;
  title: string;
  level: ExperienceLevel;
  durationMinutes: number;
  category: string;
  summary: string;
  keyTakeaways: string[];
  steps: { heading: string; body: string }[];
  practiceRecipeId: string;
}

// Database Blueprint Entities

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
}

export interface UserPreferences {
  favouriteCuisine: IndianRegion | 'All Regions';
  foodPreference: DietType;
  favouriteDishes: string[];
  spicePreference: SpiceLevel;
  allergies: string[];
  cookingExperience: ExperienceLevel;
  preferredCookingTime: PreferredTime;
  mealStyle: MealStyle;
}

export interface UserFavouriteRecipe {
  recipeId: string;
  savedAt: string;
  collectionIds: string[];
}

export interface UserCollection {
  id: string;
  name: string;
  createdAt: string;
}

export interface DailyRecommendationSet {
  date: string; // YYYY-MM-DD
  dayName: string; // Monday, Tuesday, etc.
  breakfastId: string;
  lunchId: string;
  snacksId: string;
  dinnerId: string;
  preferenceSignature: string;
  surpriseSeed: number;
}

export interface RecipeViewRecord {
  recipeId: string;
  viewedAt: string;
}

export interface CookedHistoryEntry {
  id: string;
  recipeId: string;
  cookedAt: string;
  notes?: string;
  rating?: number;
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface MealPlanEntry {
  id: string;
  day: DayOfWeek;
  mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  recipeId: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string;
  category: GroceryCategory;
  checked: boolean;
  sourceRecipeTitle?: string;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  dailySuggestionReminder: boolean;
  mealPlanReminder: boolean;
  newRecipeAlerts: boolean;
  measurementSystem: 'metric' | 'cups';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedIngredients?: string[];
}

export interface AppDatabaseState {
  currentUser: UserAccount | null;
  isNewUserOnboarding?: boolean;
  preferences: UserPreferences;
  favourites: UserFavouriteRecipe[];
  collections: UserCollection[];
  dailyRecommendations: Record<string, DailyRecommendationSet>;
  recipeViews: RecipeViewRecord[];
  cookingHistory: CookedHistoryEntry[];
  completedLessonIds: string[];
  mealPlan: MealPlanEntry[];
  shoppingList: ShoppingListItem[];
  notifications: UserNotification[];
  settings: UserSettings;
  customReviews: Record<string, RecipeReview[]>;
}

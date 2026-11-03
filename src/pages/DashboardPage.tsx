import React, { useMemo } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  ChefHat,
  ChevronRight,
  Heart,
  LogIn,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react';
import {
  CookedHistoryEntry,
  DailyRecommendationSet,
  MealPlanEntry,
  PageId,
  Recipe,
  RecipeViewRecord,
  ShoppingListItem,
  UserAccount,
  UserFavouriteRecipe,
  UserPreferences,
} from '../types';
import { COOKING_LESSONS } from '../data/recipes';
import { DishVisual } from '../components/DishVisual';

interface DashboardPageProps {
  currentUser: UserAccount | null;
  preferences: UserPreferences;
  recipes: Recipe[];
  todaysSet: DailyRecommendationSet;
  favourites: UserFavouriteRecipe[];
  recipeViews: RecipeViewRecord[];
  cookingHistory: CookedHistoryEntry[];
  mealPlan: MealPlanEntry[];
  shoppingList: ShoppingListItem[];
  completedLessonIds: string[];
  onSelectRecipe: (recipeId: string) => void;
  onToggleShoppingItem: (id: string) => void;
  onNavigate: (page: PageId) => void;
  onDemoSignIn: () => void;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  preferences,
  recipes,
  todaysSet,
  favourites,
  recipeViews,
  cookingHistory,
  mealPlan,
  shoppingList,
  completedLessonIds,
  onSelectRecipe,
  onToggleShoppingItem,
  onNavigate,
  onDemoSignIn,
}) => {
  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  // Protected Dashboard Gate when logged out
  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center mx-auto">
          <LogIn className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Sign in to your Personal Kitchen
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Your dashboard keeps your favourite Indian recipes, daily personalized suggestions, meal plans, and shopping list in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold cursor-pointer"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
          >
            Create Account
          </button>
        </div>

        <button
          type="button"
          onClick={onDemoSignIn}
          className="text-xs font-medium text-stone-500 hover:text-orange-700 underline cursor-pointer"
        >
          Continue with Demo Kitchen (Ananya Verma)
        </button>
      </div>
    );
  }

  const todaysList = [
    { slot: 'Breakfast', recipe: recipeMap.get(todaysSet.breakfastId) || recipes[0] },
    { slot: 'Lunch', recipe: recipeMap.get(todaysSet.lunchId) || recipes[2] },
    { slot: 'Dinner', recipe: recipeMap.get(todaysSet.dinnerId) || recipes[5] },
  ];

  const uncheckedShopping = shoppingList.filter((s) => !s.checked);
  const distinctDaysPlanned = new Set(mealPlan.map((m) => m.day)).size;
  const curriculumPct = Math.round(
    (completedLessonIds.length / COOKING_LESSONS.length) * 100
  );

  return (
    <div className="space-y-8">
      {/* 1. Welcome Message & Top Personal KPI Strip */}
      <section className="p-6 sm:p-8 rounded-2xl bg-stone-900 text-white border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-800">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {getTimeGreeting()}, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-sm text-stone-300 mt-1">
              Welcome to your kitchen. Here is your personal cooking overview for {todaysSet.dayName}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('ai-chef')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white text-xs font-semibold transition-colors whitespace-nowrap self-start md:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Chef</span>
          </button>
        </div>

        {/* 3 Signature Dashboard Metrics: Favourites, Cooked, Meal plans */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 tabular-nums">
          <button
            type="button"
            onClick={() => onNavigate('favourites')}
            className="text-left group cursor-pointer"
          >
            <Heart className="w-4 h-4 text-red-400 mb-2" />
            <p className="font-mono-num text-2xl sm:text-3xl font-bold text-white group-hover:text-amber-300 transition-colors">
              {favourites.length}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">Favourites</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('cooking-history')}
            className="text-left group cursor-pointer"
          >
            <ChefHat className="w-4 h-4 text-amber-400 mb-2" />
            <p className="font-mono-num text-2xl sm:text-3xl font-bold text-white group-hover:text-amber-300 transition-colors">
              {cookingHistory.length}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">Cooked</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('meal-planner')}
            className="text-left group cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-400 mb-2" />
            <p className="font-mono-num text-2xl sm:text-3xl font-bold text-white group-hover:text-amber-300 transition-colors">
              {distinctDaysPlanned}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">Meal plans</p>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Main Column (7 cols): Today's Recommendations, Favourites, Recently Viewed & Cooked */}
        <div className="lg:col-span-7 space-y-8">
          {/* Today's Food Suggestions */}
          <section className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                Today's food recommendations
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('todays-food')}
                className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
              >
                Full menu →
              </button>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {todaysList.map(({ slot, recipe }) => (
                <button
                  key={`${slot}-${recipe.id}`}
                  type="button"
                  onClick={() => onSelectRecipe(recipe.id)}
                  className="w-full py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-stone-200 dark:border-stone-800">
                      <DishVisual
                        style={recipe.visualStyle}
                        title={recipe.title}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-orange-700 dark:group-hover:text-orange-400 truncate">
                        {slot} – {recipe.title}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 tabular-nums mt-0.5">
                        {recipe.totalTimeMinutes} min · {recipe.difficulty}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-orange-700 shrink-0" />
                </button>
              ))}
            </div>
          </section>

          {/* Favourite Recipes */}
          <section className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                Saved Favourite Recipes
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('favourites')}
                className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
              >
                View all ({favourites.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favourites.slice(0, 4).map((fav) => {
                const r = recipeMap.get(fav.recipeId);
                if (!r) return null;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectRecipe(r.id)}
                    className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-orange-700/60 flex items-center gap-3 text-left cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <DishVisual style={r.visualStyle} title={r.title} className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {r.title}
                      </p>
                      <p className="text-xs text-stone-500 tabular-nums">
                        {r.totalTimeMinutes} min · {r.region.replace(' Indian', '')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Recently Cooked & Recently Viewed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <section className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  Recently Cooked
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('cooking-history')}
                  className="text-xs text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  History
                </button>
              </div>
              <ul className="space-y-2.5 text-sm">
                {cookingHistory.slice(0, 3).map((c) => {
                  const r = recipeMap.get(c.recipeId);
                  if (!r) return null;
                  return (
                    <li key={c.id} className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectRecipe(r.id)}
                        className="font-medium text-stone-800 dark:text-stone-200 hover:text-orange-700 truncate text-left cursor-pointer"
                      >
                        {r.title}
                      </button>
                      <span className="text-xs text-stone-400 tabular-nums shrink-0">
                        {c.cookedAt.slice(5, 10)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-3">
                Recently Viewed
              </h2>
              <ul className="space-y-2.5 text-sm">
                {recipeViews.slice(0, 3).map((v) => {
                  const r = recipeMap.get(v.recipeId);
                  if (!r) return null;
                  return (
                    <li
                      key={`${v.recipeId}-${v.viewedAt}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectRecipe(r.id)}
                        className="font-medium text-stone-800 dark:text-stone-200 hover:text-orange-700 truncate text-left cursor-pointer"
                      >
                        {r.title}
                      </button>
                      <span className="text-xs text-stone-400 tabular-nums shrink-0">
                        {r.totalTimeMinutes}m
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>

        {/* Right Personal Column (5 cols): Profile Overview, Upcoming Meal Plan, Shopping List Summary, Cooking Progress, AI Chef */}
        <div className="lg:col-span-5 space-y-6">
          {/* Profile Overview */}
          <section className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  Taste Profile Overview
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
              >
                Edit Profile
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
              <div>
                <dt className="text-stone-500">Diet</dt>
                <dd className="font-semibold text-stone-900 dark:text-stone-100">
                  {preferences.foodPreference}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Favourite Cuisine</dt>
                <dd className="font-semibold text-stone-900 dark:text-stone-100">
                  {preferences.favouriteCuisine}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Spice & Time</dt>
                <dd className="font-semibold text-stone-900 dark:text-stone-100">
                  {preferences.spicePreference} · {preferences.preferredCookingTime}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Skill Level</dt>
                <dd className="font-semibold text-stone-900 dark:text-stone-100">
                  {preferences.cookingExperience}
                </dd>
              </div>
            </dl>
          </section>

          {/* Upcoming Meal Plan */}
          <section className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                Upcoming Meal Plan
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('meal-planner')}
                className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
              >
                Planner →
              </button>
            </div>

            {mealPlan.length === 0 ? (
              <p className="text-xs text-stone-500">No meals scheduled yet for this week.</p>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                {mealPlan.slice(0, 4).map((entry) => {
                  const r = recipeMap.get(entry.recipeId);
                  return (
                    <li key={entry.id} className="py-2 flex items-center justify-between gap-2">
                      <span className="text-stone-500 whitespace-nowrap">
                        {entry.day.slice(0, 3)} · {entry.mealType}
                      </span>
                      {r ? (
                        <button
                          type="button"
                          onClick={() => onSelectRecipe(r.id)}
                          className="font-semibold text-stone-900 dark:text-stone-100 hover:text-orange-700 truncate cursor-pointer"
                        >
                          {r.title}
                        </button>
                      ) : (
                        <span>—</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Shopping List Summary */}
          <section className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  Shopping List ({uncheckedShopping.length} needed)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('shopping-list')}
                className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
              >
                Manage →
              </button>
            </div>

            {uncheckedShopping.length === 0 ? (
              <p className="text-xs text-stone-500">Your pantry is all stocked up!</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {uncheckedShopping.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleShoppingItem(item.id)}
                      className="flex items-center gap-2 text-left text-stone-800 dark:text-stone-200 hover:text-emerald-700 cursor-pointer"
                    >
                      <span className="w-4 h-4 rounded border border-stone-300 dark:border-stone-600 flex items-center justify-center shrink-0">
                        {item.checked && <Check className="w-3 h-3" />}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </button>
                    <span className="font-mono-num text-stone-500">{item.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Cooking Progress */}
          <section className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                Cooking Skill Progress
              </h2>
              <span className="font-mono-num text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {curriculumPct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-emerald-700 transition-all duration-200"
                style={{ width: `${curriculumPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
              <span>
                {completedLessonIds.length} of {COOKING_LESSONS.length} Indian techniques mastered
              </span>
              <button
                type="button"
                onClick={() => onNavigate('learn-cooking')}
                className="font-semibold text-orange-700 dark:text-orange-400 inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

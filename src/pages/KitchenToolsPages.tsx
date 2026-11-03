import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  ChefHat,
  Clock,
  History,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  CookedHistoryEntry,
  DayOfWeek,
  GroceryCategory,
  MealPlanEntry,
  PageId,
  Recipe,
  RecipeViewRecord,
  ShoppingListItem,
} from '../types';
import { DishVisual } from '../components/DishVisual';

const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const PLAN_SLOTS: ('Breakfast' | 'Lunch' | 'Snacks' | 'Dinner')[] = [
  'Breakfast',
  'Lunch',
  'Snacks',
  'Dinner',
];

const GROCERY_CATEGORIES: GroceryCategory[] = [
  'Produce & Herbs',
  'Dairy & Protein',
  'Spices & Masalas',
  'Grains, Lentils & Oils',
];

// ==========================================
// 1. MEAL PLANNER PAGE
// ==========================================

interface MealPlannerPageProps {
  recipes: Recipe[];
  mealPlan: MealPlanEntry[];
  onAssignMeal: (
    day: DayOfWeek,
    mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner',
    recipeId: string
  ) => void;
  onRemoveMeal: (entryId: string) => void;
  onAutoFillWeek: () => void;
  onExportWeekToShoppingList: () => void;
  onSelectRecipe: (recipeId: string) => void;
  onNavigate: (page: PageId) => void;
}

export const MealPlannerPage: React.FC<MealPlannerPageProps> = ({
  recipes,
  mealPlan,
  onAssignMeal,
  onRemoveMeal,
  onAutoFillWeek,
  onExportWeekToShoppingList,
  onSelectRecipe,
  onNavigate,
}) => {
  const [pickingSlot, setPickingSlot] = useState<{
    day: DayOfWeek;
    mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  } | null>(null);
  const [exportedBanner, setExportedBanner] = useState(false);

  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const handleExport = () => {
    onExportWeekToShoppingList();
    setExportedBanner(true);
    setTimeout(() => setExportedBanner(false), 4000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
            Weekly Kitchen Schedule
          </p>
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            Meal Planner ({mealPlan.length} meals planned)
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Plan your week across Breakfast, Lunch, Snacks, and Dinner, or auto-fill based on your food preferences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAutoFillWeek}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Fill From Preferences</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={mealPlan.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Export Week to Shopping List</span>
          </button>
        </div>
      </div>

      {exportedBanner && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4 text-sm text-emerald-900 dark:text-emerald-200"
        >
          <span>All planned meal ingredients have been merged into your Shopping List.</span>
          <button
            type="button"
            onClick={() => onNavigate('shopping-list')}
            className="font-semibold underline cursor-pointer"
          >
            Open Shopping List
          </button>
        </div>
      )}

      {/* Slot Recipe Selector Bar */}
      {pickingSlot && (
        <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border-2 border-orange-700 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
              Choose {pickingSlot.mealType} for {pickingSlot.day}
            </h2>
            <button
              type="button"
              onClick={() => setPickingSlot(null)}
              aria-label="Cancel meal selection"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {recipes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onAssignMeal(pickingSlot.day, pickingSlot.mealType, r.id);
                  setPickingSlot(null);
                }}
                className="text-left p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-orange-700 transition-colors cursor-pointer"
              >
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {r.title}
                </p>
                <p className="text-xs text-stone-500 tabular-nums mt-0.5">
                  {r.totalTimeMinutes} min · {r.diet}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Grid */}
      <div className="space-y-4">
        {DAYS.map((day) => (
          <section
            key={day}
            className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-orange-700 dark:text-orange-400" />
              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                {day}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PLAN_SLOTS.map((slot) => {
                const entry = mealPlan.find(
                  (m) => m.day === day && m.mealType === slot
                );
                const recipe = entry ? recipeMap.get(entry.recipeId) : undefined;

                return (
                  <div
                    key={slot}
                    className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between min-h-[96px]"
                  >
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                      <span className="font-medium">{slot}</span>
                      {entry && (
                        <button
                          type="button"
                          onClick={() => onRemoveMeal(entry.id)}
                          aria-label={`Remove ${slot} on ${day}`}
                          className="text-stone-400 hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {recipe ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => onSelectRecipe(recipe.id)}
                          className="text-left text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                        >
                          {recipe.title}
                        </button>
                        <p className="text-xs text-stone-500 tabular-nums mt-0.5">
                          {recipe.totalTimeMinutes} min · {recipe.difficulty}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPickingSlot({ day, mealType: slot })}
                        className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400 hover:underline mt-2 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add {slot}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 2. SHOPPING LIST PAGE
// ==========================================

interface ShoppingListPageProps {
  items: ShoppingListItem[];
  onAddItem: (name: string, amount: string, category: GroceryCategory) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearChecked: () => void;
}

export const ShoppingListPage: React.FC<ShoppingListPageProps> = ({
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onClearChecked,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('1 pack');
  const [category, setCategory] = useState<GroceryCategory>('Produce & Herbs');
  const [error, setError] = useState('');

  const remainingCount = items.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter an ingredient or grocery item name.');
      return;
    }
    setError('');
    onAddItem(name.trim(), amount.trim() || '1 unit', category);
    setName('');
    setAmount('1 pack');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
            Kitchen Grocery Checklist
          </p>
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            Shopping List ({remainingCount} remaining)
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Items added from Today's Food, Recipe Details, Ingredient Finder, and Meal Planner are organized by aisle.
          </p>
        </div>

        {checkedCount > 0 && (
          <button
            type="button"
            onClick={onClearChecked}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Purchased ({checkedCount})</span>
          </button>
        )}
      </div>

      {/* Add Grocery Item Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label htmlFor="grocery-name-input" className="sr-only">
              Grocery item name
            </label>
            <input
              id="grocery-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add item (e.g., Curry Leaves, Basmati Rice)..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="grocery-amount-input" className="sr-only">
              Quantity
            </label>
            <input
              id="grocery-amount-input"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Quantity"
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="grocery-cat-select" className="sr-only">
              Category
            </label>
            <select
              id="grocery-cat-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as GroceryCategory)}
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            >
              {GROCERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full px-4 py-2.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>

      {/* Categorized Lists */}
      {items.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            Your shopping list is empty
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Add items manually above or generate a shopping list from Today's Food or any Recipe page.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {GROCERY_CATEGORIES.map((cat) => {
            const groupItems = items.filter((i) => i.category === cat);
            if (groupItems.length === 0) return null;

            return (
              <section
                key={cat}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden"
              >
                <div className="px-5 py-3 bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-stone-700 dark:text-stone-300 font-sans">
                    {cat}
                  </h2>
                  <span className="text-xs text-stone-500 tabular-nums">
                    {groupItems.length}
                  </span>
                </div>

                <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                  {groupItems.map((item) => (
                    <li
                      key={item.id}
                      className="px-5 py-3.5 flex items-center justify-between gap-4"
                    >
                      <button
                        type="button"
                        onClick={() => onToggleItem(item.id)}
                        aria-label={`Mark ${item.name} as ${item.checked ? 'needed' : 'purchased'}`}
                        className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                      >
                        <span
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            item.checked
                              ? 'bg-emerald-700 border-emerald-700 text-white'
                              : 'border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              item.checked
                                ? 'line-through text-stone-400'
                                : 'text-stone-900 dark:text-stone-100'
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.sourceRecipeTitle && (
                            <span className="block text-xs text-stone-500">
                              For {item.sourceRecipeTitle}
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-mono-num text-xs text-stone-600 dark:text-stone-400">
                          {item.amount}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          aria-label={`Delete ${item.name}`}
                          className="text-stone-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. COOKING HISTORY & RECENTLY VIEWED PAGE
// ==========================================

interface CookingHistoryPageProps {
  recipes: Recipe[];
  cookingHistory: CookedHistoryEntry[];
  recipeViews: RecipeViewRecord[];
  onSelectRecipe: (recipeId: string) => void;
  onNavigate: (page: PageId) => void;
}

export const CookingHistoryPage: React.FC<CookingHistoryPageProps> = ({
  recipes,
  cookingHistory,
  recipeViews,
  onSelectRecipe,
  onNavigate,
}) => {
  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
          Personal Kitchen Journal
        </p>
        <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
          Cooking History
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Track every Indian dish you have cooked at home alongside your recently viewed recipes.
        </p>
      </div>

      {/* Cooked Log */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-orange-700 dark:text-orange-400" />
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            Recently Cooked Dishes ({cookingHistory.length})
          </h2>
        </div>

        {cookingHistory.length === 0 ? (
          <div className="p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center">
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
              You have not logged any cooked recipes yet. Open any recipe and click "Mark as Cooked".
            </p>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="px-4 py-2 rounded-lg bg-orange-700 text-white text-xs font-semibold cursor-pointer"
            >
              Find a Recipe to Cook
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cookingHistory.map((entry) => {
              const recipe = recipeMap.get(entry.recipeId);
              if (!recipe) return null;
              return (
                <article
                  key={entry.id}
                  className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex gap-4 items-center"
                >
                  <button
                    type="button"
                    onClick={() => onSelectRecipe(recipe.id)}
                    className="w-24 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                  >
                    <DishVisual
                      style={recipe.visualStyle}
                      title={recipe.title}
                      className="w-full h-full"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 tabular-nums">
                      Cooked on {entry.cookedAt.slice(0, 10)}
                      {entry.rating ? ` · ${'★'.repeat(entry.rating)}` : ''}
                    </p>
                    <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                      <button
                        type="button"
                        onClick={() => onSelectRecipe(recipe.id)}
                        className="hover:text-orange-700 cursor-pointer"
                      >
                        {recipe.title}
                      </button>
                    </h3>
                    {entry.notes && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-stone-500" />
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            Recently Viewed Recipes ({recipeViews.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipeViews.map((v) => {
            const recipe = recipeMap.get(v.recipeId);
            if (!recipe) return null;
            return (
              <button
                key={`${v.recipeId}-${v.viewedAt}`}
                type="button"
                onClick={() => onSelectRecipe(recipe.id)}
                className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-700/60 text-left flex items-center gap-3.5 transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <DishVisual
                    style={recipe.visualStyle}
                    title={recipe.title}
                    className="w-full h-full"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate font-sans">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-stone-500 tabular-nums flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {recipe.totalTimeMinutes} min · {recipe.difficulty}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

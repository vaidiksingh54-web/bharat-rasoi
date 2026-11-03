import React, { useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Heart,
  RefreshCw,
  ShoppingBag,
  Shuffle,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DailyRecommendationSet,
  PageId,
  Recipe,
  UserPreferences,
} from '../types';
import { DishVisual } from '../components/DishVisual';
import { generateDailyRecommendations } from '../utils/recommendationEngine';

interface TodaysFoodPageProps {
  recipes: Recipe[];
  todaysSet: DailyRecommendationSet;
  preferences: UserPreferences;
  favouriteIds: Set<string>;
  onSelectRecipe: (recipeId: string) => void;
  onToggleFavourite: (recipeId: string) => void;
  onSwapSlot: (slot: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner') => void;
  onSurpriseMe: () => void;
  onGenerateShoppingList: (recipeIds: string[]) => void;
  onNavigate: (page: PageId) => void;
}

const SLOTS: ('Breakfast' | 'Lunch' | 'Snacks' | 'Dinner')[] = [
  'Breakfast',
  'Lunch',
  'Snacks',
  'Dinner',
];

export const TodaysFoodPage: React.FC<TodaysFoodPageProps> = ({
  recipes,
  todaysSet,
  preferences,
  favouriteIds,
  onSelectRecipe,
  onToggleFavourite,
  onSwapSlot,
  onSurpriseMe,
  onGenerateShoppingList,
  onNavigate,
}) => {
  const [shoppingAddedBanner, setShoppingAddedBanner] = useState(false);

  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const slotEntries = [
    { slot: 'Breakfast' as const, recipe: recipeMap.get(todaysSet.breakfastId) || recipes[0] },
    { slot: 'Lunch' as const, recipe: recipeMap.get(todaysSet.lunchId) || recipes[1] },
    { slot: 'Snacks' as const, recipe: recipeMap.get(todaysSet.snacksId) || recipes[7] },
    { slot: 'Dinner' as const, recipe: recipeMap.get(todaysSet.dinnerId) || recipes[2] },
  ];

  // Generate deterministic upcoming 4-day preview to show day-by-day variety
  const multiDayPreview = useMemo(() => {
    const baseParts = todaysSet.date.split('-').map(Number);
    const baseDate = new Date(baseParts[0], (baseParts[1] || 1) - 1, baseParts[2] || 1);
    const days: { dateStr: string; set: DailyRecommendationSet }[] = [];

    for (let offset = 0; offset < 4; offset++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + offset);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const set =
        offset === 0
          ? todaysSet
          : generateDailyRecommendations(recipes, dateStr, preferences, [
              todaysSet.breakfastId,
              todaysSet.lunchId,
              todaysSet.snacksId,
              todaysSet.dinnerId,
            ]);
      days.push({ dateStr, set });
    }
    return days;
  }, [recipes, todaysSet, preferences]);

  const handleGenerateList = () => {
    const ids = slotEntries.map((s) => s.recipe.id);
    onGenerateShoppingList(ids);
    setShoppingAddedBanner(true);
    setTimeout(() => setShoppingAddedBanner(false), 4000);
  };

  return (
    <div className="space-y-10">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
            {todaysSet.dayName} · {todaysSet.date} · Consistent All Day
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Today's Food Recommendations
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            Tailored for your profile:{' '}
            <strong className="text-stone-800 dark:text-stone-200">
              {preferences.foodPreference}
            </strong>{' '}
            ·{' '}
            <strong className="text-stone-800 dark:text-stone-200">
              {preferences.favouriteCuisine}
            </strong>{' '}
            ·{' '}
            <strong className="text-stone-800 dark:text-stone-200">
              {preferences.spicePreference} Spice
            </strong>{' '}
            ·{' '}
            <strong className="text-stone-800 dark:text-stone-200">
              {preferences.preferredCookingTime}
            </strong>
            {preferences.allergies.length > 0 && (
              <span> · Avoiding {preferences.allergies.join(', ')}</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onSurpriseMe}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <Shuffle className="w-4 h-4" aria-hidden="true" />
            <span>Surprise Me</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateList}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>Generate Shopping List</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Edit Preferences</span>
          </button>
        </div>
      </div>

      {shoppingAddedBanner && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4 text-sm text-emerald-900 dark:text-emerald-200"
        >
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              Ingredients for all four of today's recommended dishes have been added to your Shopping List.
            </span>
          </span>
          <button
            type="button"
            onClick={() => onNavigate('shopping-list')}
            className="font-semibold underline whitespace-nowrap cursor-pointer"
          >
            View Shopping List
          </button>
        </div>
      )}

      {/* 4 Daily Meal Cards: Breakfast, Lunch, Snacks, Dinner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slotEntries.map(({ slot, recipe }) => {
          const isFav = favouriteIds.has(recipe.id);
          return (
            <article
              key={slot}
              className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden flex flex-col sm:flex-row"
            >
              <div className="sm:w-48 md:w-52 aspect-[4/3] sm:aspect-auto relative shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectRecipe(recipe.id)}
                  aria-label={`View ${slot} recipe: ${recipe.title}`}
                  className="block w-full h-full cursor-pointer"
                >
                  <DishVisual
                    style={recipe.visualStyle}
                    title={recipe.title}
                    className="w-full h-full min-h-[180px]"
                  />
                </button>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                      {slot}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleFavourite(recipe.id)}
                      aria-label={
                        isFav
                          ? `Remove ${recipe.title} from favourites`
                          : `Save ${recipe.title} to favourites`
                      }
                      className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-red-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'fill-red-600 text-red-600' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectRecipe(recipe.id)}
                      className="text-left hover:text-orange-700 dark:hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      {recipe.title}
                    </button>
                  </h2>

                  <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-3">
                    {recipe.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 tabular-nums mb-4">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{recipe.totalTimeMinutes} min</span>
                    <span aria-hidden="true">·</span>
                    <span>{recipe.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{recipe.diet}</span>
                    <span aria-hidden="true">·</span>
                    <span>{recipe.calories} kcal</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectRecipe(recipe.id)}
                    className="text-xs font-semibold text-stone-900 dark:text-stone-100 hover:text-orange-700 dark:hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    Cook This Dish →
                  </button>

                  <button
                    type="button"
                    onClick={() => onSwapSlot(slot)}
                    aria-label={`Suggest alternative ${slot} recipe`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" aria-hidden="true" />
                    <span>Alternative</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Multi-Day Rotation Table Preview */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
            Upcoming Daily Rotation
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Each day automatically rotates dishes based on your preferences and avoids repeating yesterday's menu.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-500 dark:text-stone-400">
                <th className="py-3 pr-4">Meal</th>
                {multiDayPreview.map(({ dateStr, set }, idx) => (
                  <th key={dateStr} className="py-3 px-4 whitespace-nowrap">
                    <span className="text-stone-900 dark:text-stone-100">{set.dayName}</span>
                    {idx === 0 && (
                      <span className="ml-1.5 text-orange-700 dark:text-orange-400 font-medium">
                        (Today)
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {SLOTS.map((slot) => (
                <tr key={slot}>
                  <td className="py-3 pr-4 font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap">
                    {slot}
                  </td>
                  {multiDayPreview.map(({ dateStr, set }) => {
                    const id =
                      slot === 'Breakfast'
                        ? set.breakfastId
                        : slot === 'Lunch'
                        ? set.lunchId
                        : slot === 'Snacks'
                        ? set.snacksId
                        : set.dinnerId;
                    const r = recipeMap.get(id);
                    return (
                      <td key={`${dateStr}-${slot}`} className="py-3 px-4">
                        {r ? (
                          <button
                            type="button"
                            onClick={() => onSelectRecipe(r.id)}
                            className="text-left text-stone-800 dark:text-stone-200 hover:text-orange-700 dark:hover:text-orange-400 transition-colors cursor-pointer"
                          >
                            <span className="block font-medium">{r.title}</span>
                            <span className="text-xs text-stone-500 tabular-nums">
                              {r.totalTimeMinutes} min · {r.difficulty}
                            </span>
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

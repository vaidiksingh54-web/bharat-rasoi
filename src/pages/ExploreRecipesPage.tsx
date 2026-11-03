import React, { useMemo } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import {
  DietType,
  Difficulty,
  IndianRegion,
  MealCategory,
  Recipe,
} from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { isDietCompatible } from '../utils/recommendationEngine';

export interface ExploreFilters {
  query: string;
  region: IndianRegion | 'All';
  mealCategory: MealCategory | 'All';
  diet: DietType | 'All';
  difficulty: Difficulty | 'All';
  maxTime: number | null;
  sortBy: 'popular' | 'fastest' | 'rating';
}

interface ExploreRecipesPageProps {
  recipes: Recipe[];
  filters: ExploreFilters;
  onChangeFilters: (next: Partial<ExploreFilters>) => void;
  onResetFilters: () => void;
  favouriteIds: Set<string>;
  onSelectRecipe: (recipeId: string) => void;
  onToggleFavourite: (recipeId: string) => void;
}

const REGIONS: (IndianRegion | 'All')[] = [
  'All',
  'North Indian',
  'South Indian',
  'West Indian',
  'East Indian',
  'Central Indian',
  'Northeast Indian',
];

const MEAL_CATEGORIES: (MealCategory | 'All')[] = [
  'All',
  'Breakfast',
  'Lunch',
  'Snacks',
  'Dinner',
  'Dessert',
];

const DIETS: (DietType | 'All')[] = [
  'All',
  'Vegetarian',
  'Vegan',
  'Eggetarian',
  'Non-vegetarian',
];

export const ExploreRecipesPage: React.FC<ExploreRecipesPageProps> = ({
  recipes,
  filters,
  onChangeFilters,
  onResetFilters,
  favouriteIds,
  onSelectRecipe,
  onToggleFavourite,
}) => {
  const filteredRecipes = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    return recipes
      .filter((r) => {
        if (filters.region !== 'All' && r.region !== filters.region) return false;
        if (
          filters.mealCategory !== 'All' &&
          !r.mealCategories.includes(filters.mealCategory)
        ) {
          return false;
        }
        if (filters.diet !== 'All' && !isDietCompatible(r.diet, filters.diet)) {
          return false;
        }
        if (filters.difficulty !== 'All' && r.difficulty !== filters.difficulty) {
          return false;
        }
        if (filters.maxTime && r.totalTimeMinutes > filters.maxTime) {
          return false;
        }
        if (q) {
          const hay = [
            r.title,
            r.hindiName,
            r.description,
            r.region,
            r.diet,
            ...r.ingredients.map((i) => i.name),
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'fastest') {
          return a.totalTimeMinutes - b.totalTimeMinutes;
        }
        if (filters.sortBy === 'rating') {
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        }
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.reviewCount - a.reviewCount;
      });
  }, [recipes, filters]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
          Complete Recipe Index
        </p>
        <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Explore Indian Recipes
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
          Filter across regional kitchens, meal occasions, dietary lifestyles, and cooking times to find your next dish.
        </p>
      </div>

      {/* Filter Panel */}
      <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <label htmlFor="explore-search-input" className="sr-only">
              Search recipes
            </label>
            <Search
              className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="explore-search-input"
              type="search"
              value={filters.query}
              onChange={(e) => onChangeFilters({ query: e.target.value })}
              placeholder="Search dish name, ingredient, or spice..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-700"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="explore-diet-select" className="sr-only">
              Dietary preference
            </label>
            <select
              id="explore-diet-select"
              value={filters.diet}
              onChange={(e) => onChangeFilters({ diet: e.target.value as DietType | 'All' })}
              className="w-full px-3 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            >
              {DIETS.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Diets' : d}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="explore-difficulty-select" className="sr-only">
              Difficulty
            </label>
            <select
              id="explore-difficulty-select"
              value={filters.difficulty}
              onChange={(e) =>
                onChangeFilters({ difficulty: e.target.value as Difficulty | 'All' })
              }
              className="w-full px-3 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            >
              <option value="All">Any Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <label htmlFor="explore-sort-select" className="sr-only">
              Sort recipes
            </label>
            <select
              id="explore-sort-select"
              value={filters.sortBy}
              onChange={(e) =>
                onChangeFilters({
                  sortBy: e.target.value as ExploreFilters['sortBy'],
                })
              }
              className="flex-1 px-3 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            >
              <option value="popular">Sort: Popular</option>
              <option value="fastest">Sort: Fastest Time</option>
              <option value="rating">Sort: Highest Rated</option>
            </select>

            <button
              type="button"
              onClick={onResetFilters}
              aria-label="Reset recipe filters"
              className="px-3 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Regional & Meal Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          {REGIONS.map((region) => {
            const active = filters.region === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => onChangeFilters({ region })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 dark:bg-stone-800 dark:text-stone-400 dark:hover:text-stone-100'
                }`}
              >
                {region === 'All' ? 'All Regions' : region.replace(' Indian', '')}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {MEAL_CATEGORIES.map((cat) => {
              const active = filters.mealCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onChangeFilters({ mealCategory: cat })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-orange-700 text-white'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {cat === 'All' ? 'All Meals' : cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                onChangeFilters({ maxTime: filters.maxTime === 30 ? null : 30 })
              }
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                filters.maxTime === 30
                  ? 'border-orange-700 bg-orange-50 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Under 30 mins
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400">
        <p className="tabular-nums">
          Showing <strong className="text-stone-900 dark:text-stone-100">{filteredRecipes.length}</strong>{' '}
          {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>

      {/* Grid or Empty State */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavourite={favouriteIds.has(recipe.id)}
              onSelect={onSelectRecipe}
              onToggleFavourite={onToggleFavourite}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            No matching recipes found
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-5 max-w-md mx-auto">
            Try relaxing your dietary, regional, or time filters to see more Indian dishes.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 rounded-lg bg-orange-700 text-white text-sm font-semibold hover:bg-orange-800 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

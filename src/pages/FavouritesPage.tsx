import React, { useMemo, useState } from 'react';
import { FolderPlus, Heart, Search, Trash2 } from 'lucide-react';
import {
  MealCategory,
  PageId,
  Recipe,
  UserCollection,
  UserFavouriteRecipe,
} from '../types';
import { DishVisual } from '../components/DishVisual';

interface FavouritesPageProps {
  recipes: Recipe[];
  favourites: UserFavouriteRecipe[];
  collections: UserCollection[];
  onSelectRecipe: (recipeId: string) => void;
  onRemoveFavourite: (recipeId: string) => void;
  onCreateCollection: (name: string) => void;
  onToggleRecipeCollection: (recipeId: string, collectionId: string) => void;
  onNavigate: (page: PageId) => void;
}

export const FavouritesPage: React.FC<FavouritesPageProps> = ({
  recipes,
  favourites,
  collections,
  onSelectRecipe,
  onRemoveFavourite,
  onCreateCollection,
  onToggleRecipeCollection,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MealCategory | 'All'>('All');
  const [activeCollectionId, setActiveCollectionId] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'time-asc' | 'time-desc'>('recent');
  const [newCollectionName, setNewCollectionName] = useState('');

  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const savedEntries = useMemo(() => {
    const q = search.trim().toLowerCase();

    return favourites
      .map((fav) => ({
        fav,
        recipe: recipeMap.get(fav.recipeId),
      }))
      .filter((item): item is { fav: UserFavouriteRecipe; recipe: Recipe } => Boolean(item.recipe))
      .filter(({ fav, recipe }) => {
        if (
          activeCollectionId !== 'All' &&
          !fav.collectionIds.includes(activeCollectionId)
        ) {
          return false;
        }
        if (
          categoryFilter !== 'All' &&
          !recipe.mealCategories.includes(categoryFilter)
        ) {
          return false;
        }
        if (q) {
          const hay = `${recipe.title} ${recipe.region} ${recipe.diet}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time-asc') {
          return a.recipe.totalTimeMinutes - b.recipe.totalTimeMinutes;
        }
        if (sortBy === 'time-desc') {
          return b.recipe.totalTimeMinutes - a.recipe.totalTimeMinutes;
        }
        return b.fav.savedAt.localeCompare(a.fav.savedAt);
      });
  }, [favourites, recipeMap, activeCollectionId, categoryFilter, search, sortBy]);

  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newCollectionName.trim();
    if (!cleaned) return;
    onCreateCollection(cleaned);
    setNewCollectionName('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
            Personal Recipe Box
          </p>
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            Favourite Recipes ({favourites.length})
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Organize your saved dishes into custom collections like Breakfast, Lunch, and Desserts, or sort by cooking time.
          </p>
        </div>

        {/* Create Custom Collection */}
        <form onSubmit={handleAddCollection} className="flex gap-2">
          <label htmlFor="new-collection-input" className="sr-only">
            New collection name
          </label>
          <input
            id="new-collection-input"
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New collection (e.g., Festive)..."
            className="px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create Collection</span>
          </button>
        </form>
      </div>

      {/* Collections Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveCollectionId('All')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeCollectionId === 'All'
              ? 'bg-orange-700 text-white'
              : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
          }`}
        >
          All Saved ({favourites.length})
        </button>

        {collections.map((col) => {
          const count = favourites.filter((f) => f.collectionIds.includes(col.id)).length;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveCollectionId(col.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors tabular-nums cursor-pointer ${
                activeCollectionId === col.id
                  ? 'bg-orange-700 text-white'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {col.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Search, Category Filter & Sort */}
      <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <label htmlFor="fav-search-input" className="sr-only">
            Search saved recipes
          </label>
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="fav-search-input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within your saved recipes..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="md:col-span-3">
          <label htmlFor="fav-category-select" className="sr-only">
            Filter by meal category
          </label>
          <select
            id="fav-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as MealCategory | 'All')}
            className="w-full px-3 py-2 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
          >
            <option value="All">All Meal Categories</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Snacks">Snacks</option>
            <option value="Dinner">Dinner</option>
            <option value="Dessert">Dessert</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="fav-sort-select" className="sr-only">
            Sort favourites
          </label>
          <select
            id="fav-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
          >
            <option value="recent">Sort: Recently Saved</option>
            <option value="time-asc">Cooking Time: Shortest First</option>
            <option value="time-desc">Cooking Time: Longest First</option>
          </select>
        </div>
      </div>

      {/* Saved Cards */}
      {savedEntries.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <Heart className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            No saved recipes match this view
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-5">
            Save dishes using the heart button while exploring Indian recipes.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="px-4 py-2 rounded-lg bg-orange-700 text-white text-xs font-semibold cursor-pointer"
          >
            Explore Recipes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedEntries.map(({ fav, recipe }) => (
            <article
              key={recipe.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden flex flex-col"
            >
              <button
                type="button"
                onClick={() => onSelectRecipe(recipe.id)}
                className="aspect-[4/3] w-full overflow-hidden text-left cursor-pointer"
              >
                <DishVisual
                  style={recipe.visualStyle}
                  title={recipe.title}
                  className="w-full h-full"
                />
              </button>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 tabular-nums mb-1">
                    {recipe.totalTimeMinutes} min · {recipe.difficulty} · {recipe.region}
                  </p>
                  <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                    <button
                      type="button"
                      onClick={() => onSelectRecipe(recipe.id)}
                      className="text-left hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                    >
                      {recipe.title}
                    </button>
                  </h2>
                </div>

                <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <div>
                    <p className="text-xs text-stone-500 mb-1.5">Collections:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {collections.map((col) => {
                        const inCol = fav.collectionIds.includes(col.id);
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => onToggleRecipeCollection(recipe.id, col.id)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                              inCol
                                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                            }`}
                          >
                            {inCol ? `✓ ${col.name}` : `+ ${col.name}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectRecipe(recipe.id)}
                      className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      View Recipe
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveFavourite(recipe.id)}
                      aria-label={`Remove ${recipe.title} from favourites`}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

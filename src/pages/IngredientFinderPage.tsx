import React, { useMemo, useState } from 'react';
import { Check, Plus, ShoppingBag, X } from 'lucide-react';
import { DietType, IngredientItem, PageId, Recipe } from '../types';
import { PANTRY_INGREDIENT_GROUPS } from '../data/recipes';
import { DishVisual } from '../components/DishVisual';
import { matchRecipesByIngredients } from '../utils/recommendationEngine';

interface IngredientFinderPageProps {
  recipes: Recipe[];
  defaultDiet: DietType;
  onSelectRecipe: (recipeId: string) => void;
  onAddMissingIngredients: (items: IngredientItem[], recipeTitle: string) => void;
  onNavigate: (page: PageId) => void;
}

export const IngredientFinderPage: React.FC<IngredientFinderPageProps> = ({
  recipes,
  defaultDiet,
  onSelectRecipe,
  onAddMissingIngredients,
  onNavigate,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    'Onion',
    'Tomato',
    'Paneer',
    'Whole Wheat Bread',
  ]);
  const [customInput, setCustomInput] = useState('');
  const [dietFilter, setDietFilter] = useState<DietType | 'All'>(defaultDiet);
  const [addedRecipeId, setAddedRecipeId] = useState<string | null>(null);

  const toggleIngredient = (item: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customInput.trim();
    if (!cleaned) return;
    if (!selectedIngredients.includes(cleaned)) {
      setSelectedIngredients((prev) => [...prev, cleaned]);
    }
    setCustomInput('');
  };

  const results = useMemo(
    () => matchRecipesByIngredients(recipes, selectedIngredients, dietFilter),
    [recipes, selectedIngredients, dietFilter]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
            Cook From What You Have
          </p>
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Ingredient Finder
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            Select vegetables, grains, lentils, or proteins currently in your kitchen to discover Indian dishes you can make right now.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="finder-diet-select" className="text-xs font-medium text-stone-600 dark:text-stone-400">
            Diet:
          </label>
          <select
            id="finder-diet-select"
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value as DietType | 'All')}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          >
            <option value="All">All Diets</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Eggetarian">Eggetarian</option>
            <option value="Non-vegetarian">Non-vegetarian</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Pantry Selector */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-5">
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <label htmlFor="custom-pantry-input" className="sr-only">
              Add an ingredient you have
            </label>
            <input
              id="custom-pantry-input"
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Add custom ingredient (e.g., Cashews, Mint)..."
              className="flex-1 px-3.5 py-2 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {selectedIngredients.length > 0 && (
            <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 tabular-nums">
                  In Your Pantry ({selectedIngredients.length})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIngredients([])}
                  className="text-xs text-stone-500 hover:text-red-600 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedIngredients.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleIngredient(item)}
                    aria-label={`Remove ${item}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-700 text-white text-xs font-medium cursor-pointer"
                  >
                    <span>{item}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {PANTRY_INGREDIENT_GROUPS.map((group) => (
              <div key={group.category}>
                <h2 className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2 font-sans">
                  {group.category}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => {
                    const active = selectedIngredients.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleIngredient(item)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-orange-50 border-orange-700 text-orange-800 dark:bg-orange-950/60 dark:border-orange-500 dark:text-orange-300'
                            : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Matched Recipes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              Matching Recipes ({results.length})
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="p-10 text-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
                Select at least one ingredient on the left to see recipes you can cook.
              </p>
              <button
                type="button"
                onClick={() =>
                  setSelectedIngredients(['Onion', 'Tomato', 'Toor Dal', 'Basmati Rice'])
                }
                className="px-4 py-2 rounded-lg bg-orange-700 text-white text-xs font-semibold cursor-pointer"
              >
                Load Common Indian Staples
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {results.slice(0, 8).map((res) => (
                <article
                  key={res.recipe.id}
                  className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-4"
                >
                  <button
                    type="button"
                    onClick={() => onSelectRecipe(res.recipe.id)}
                    className="sm:w-36 aspect-[4/3] rounded-lg overflow-hidden shrink-0 cursor-pointer"
                  >
                    <DishVisual
                      style={res.recipe.visualStyle}
                      title={res.recipe.title}
                      className="w-full h-full"
                    />
                  </button>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs mb-1 tabular-nums">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {res.matchPercentage}% Ingredient Match ({res.matchedIngredients.length}/
                          {res.matchedIngredients.length + res.missingIngredients.length})
                        </span>
                        <span className="text-stone-500">
                          {res.recipe.totalTimeMinutes} min · {res.recipe.difficulty}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                        <button
                          type="button"
                          onClick={() => onSelectRecipe(res.recipe.id)}
                          className="text-left hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                        >
                          {res.recipe.title}
                        </button>
                      </h3>

                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        <strong>You have:</strong> {res.matchedIngredients.join(', ')}
                      </p>
                      {res.missingIngredients.length > 0 && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          <strong>Need:</strong>{' '}
                          {res.missingIngredients.map((m) => m.name).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectRecipe(res.recipe.id)}
                        className="text-xs font-semibold text-stone-900 dark:text-stone-100 hover:text-orange-700 cursor-pointer"
                      >
                        Open Recipe →
                      </button>

                      {res.missingIngredients.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            onAddMissingIngredients(
                              res.missingIngredients,
                              res.recipe.title
                            );
                            setAddedRecipeId(res.recipe.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-medium text-stone-800 dark:text-stone-200 cursor-pointer"
                        >
                          {addedRecipeId === res.recipe.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('shopping-list');
                                }}
                              >
                                Added · View List
                              </span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add {res.missingIngredients.length} missing to Shopping List</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowRight, Compass, Search, Sparkles } from 'lucide-react';
import { DailyRecommendationSet, IndianRegion, PageId, Recipe } from '../types';
import { REGION_GUIDES } from '../data/recipes';
import { RecipeCard } from '../components/RecipeCard';

interface HomePageProps {
  recipes: Recipe[];
  todaysSet: DailyRecommendationSet;
  favouriteIds: Set<string>;
  onSelectRecipe: (recipeId: string) => void;
  onToggleFavourite: (recipeId: string) => void;
  onNavigate: (page: PageId) => void;
  onSearchSubmit: (query: string) => void;
  onExploreRegion: (region: IndianRegion) => void;
  onExploreBeginner: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  recipes,
  todaysSet,
  favouriteIds,
  onSelectRecipe,
  onToggleFavourite,
  onNavigate,
  onSearchSubmit,
  onExploreRegion,
  onExploreBeginner,
}) => {
  const [heroSearch, setHeroSearch] = useState('');

  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  const todaysRecommendations: { slot: string; recipe: Recipe }[] = [
    { slot: 'Breakfast', recipe: recipeMap.get(todaysSet.breakfastId) || recipes[0] },
    { slot: 'Lunch', recipe: recipeMap.get(todaysSet.lunchId) || recipes[1] },
    { slot: 'Snacks', recipe: recipeMap.get(todaysSet.snacksId) || recipes[7] },
    { slot: 'Dinner', recipe: recipeMap.get(todaysSet.dinnerId) || recipes[2] },
  ].filter((item) => Boolean(item.recipe));

  const popularRecipes = recipes.filter((r) => r.isPopular).slice(0, 4);
  const beginnerRecipes = recipes.filter((r) => r.isBeginnerFriendly).slice(0, 4);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(heroSearch.trim());
  };

  return (
    <div className="space-y-16">
      {/* 2. Hero Banner – Indian Food Photography & Search Bar */}
      <section className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[420px]">
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center z-10 bg-stone-900">
            <p className="text-xs font-medium text-amber-400 mb-3">
              Authentic Regional Indian Kitchen
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight balance-text mb-4">
              Cook timeless Indian meals with confidence every day
            </h1>
            <p className="text-base text-stone-300 max-w-xl leading-relaxed mb-8">
              Explore heirloom recipes from six Indian culinary regions, tailored daily menus for your taste profile, and step-by-step home kitchen guidance.
            </p>

            <form onSubmit={handleHeroSubmit} className="max-w-xl w-full" role="search">
              <label htmlFor="hero-recipe-search" className="sr-only">
                Search recipes by dish, spice, or ingredient
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search
                    className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="hero-recipe-search"
                    type="search"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Find recipes like Masala Dosa, Paneer, Dal Tadka..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-stone-900 text-sm placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-orange-700 hover:bg-orange-600 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Find Recipes
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
            <img
              src="/assets/aistudio/Screenshot_2026-11-03_232145_4e222cc4.png"
              alt="Overhead spread of authentic Indian curries, paneer tikka, palak paneer, pulao, and chutneys"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-900 via-stone-900/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* 3. Today's Recommendations – 4 Food Suggestions */}
      <section aria-labelledby="home-todays-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
              {todaysSet.dayName} Menu · Personalized Daily Picks
            </p>
            <h2
              id="home-todays-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100"
            >
              Today's Recommendations
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('todays-food')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 dark:text-orange-400 hover:underline whitespace-nowrap cursor-pointer"
          >
            <span>Open Full Daily Menu</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {todaysRecommendations.map(({ slot, recipe }) => (
            <RecipeCard
              key={`${slot}-${recipe.id}`}
              recipe={recipe}
              isFavourite={favouriteIds.has(recipe.id)}
              onSelect={onSelectRecipe}
              onToggleFavourite={onToggleFavourite}
              subtitleNote={`${slot} · ${recipe.diet}`}
            />
          ))}
        </div>
      </section>

      {/* 4. Popular Indian Recipes */}
      <section aria-labelledby="home-popular-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              Most Loved Across Home Kitchens
            </p>
            <h2
              id="home-popular-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100"
            >
              Popular Indian Recipes
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 dark:text-orange-400 hover:underline whitespace-nowrap cursor-pointer"
          >
            <span>Browse All Recipes</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavourite={favouriteIds.has(recipe.id)}
              onSelect={onSelectRecipe}
              onToggleFavourite={onToggleFavourite}
            />
          ))}
        </div>
      </section>

      {/* 5. Explore Indian Cuisine – North, South, East, West, Central & Northeast */}
      <section aria-labelledby="home-regions-heading">
        <div className="mb-6">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
            Six Culinary Traditions of India
          </p>
          <h2
            id="home-regions-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100"
          >
            Explore Indian Cuisine
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REGION_GUIDES.map((item) => (
            <button
              key={item.region}
              type="button"
              aria-label={`Explore ${item.region} recipes`}
              onClick={() => onExploreRegion(item.region)}
              className="group text-left p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-700/50 dark:hover:border-orange-500/50 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
                    {item.region.replace(' Indian', '')}
                  </h3>
                  <Compass
                    className="w-4 h-4 text-stone-400 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">
                  {item.tagline}
                </p>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 pt-3 border-t border-stone-100 dark:border-stone-800">
                {item.signatureDishes}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 6. Beginner-Friendly Recipes */}
      <section aria-labelledby="home-beginner-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
              20–30 Minute Everyday Staples · Minimal Prep
            </p>
            <h2
              id="home-beginner-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100"
            >
              Beginner-Friendly Recipes
            </h2>
          </div>
          <button
            type="button"
            onClick={onExploreBeginner}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 dark:text-orange-400 hover:underline whitespace-nowrap cursor-pointer"
          >
            <span>See Easy Recipes</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {beginnerRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavourite={favouriteIds.has(recipe.id)}
              onSelect={onSelectRecipe}
              onToggleFavourite={onToggleFavourite}
            />
          ))}
        </div>
      </section>

      {/* 7. AI Chef Introduction – Link to AI Assistant */}
      <section
        aria-labelledby="home-aichef-heading"
        className="rounded-2xl bg-stone-900 dark:bg-stone-900 border border-stone-800 p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-amber-400 mb-2">
            Intelligent Kitchen Companion
          </p>
          <h2
            id="home-aichef-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 balance-text"
          >
            Meet your Bharat Rasoi AI Chef
          </h2>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Unsure how to balance spice in a curry, substitute ingredients on the fly, or turn three vegetables in your fridge into dinner? Ask your AI Chef for step-by-step guidance tailored to your dietary preferences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('ai-chef')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-700 hover:bg-orange-600 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Open AI Chef</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('ingredient-finder')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Try Ingredient Finder</span>
          </button>
        </div>
      </section>
    </div>
  );
};

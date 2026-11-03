import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChefHat,
  Clock,
  Heart,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShoppingBag,
  Star,
  Timer,
} from 'lucide-react';
import { PageId, Recipe, RecipeReview } from '../types';
import { DishVisual } from '../components/DishVisual';
import { scaleIngredientAmount } from '../utils/recommendationEngine';

interface RecipeDetailsPageProps {
  recipe: Recipe;
  customReviews: RecipeReview[];
  isFavourite: boolean;
  onBack: () => void;
  onToggleFavourite: (recipeId: string) => void;
  onAddIngredientsToShoppingList: (recipe: Recipe, servings: number) => void;
  onMarkCooked: (recipeId: string, notes: string, rating: number) => void;
  onAddReview: (recipeId: string, rating: number, comment: string) => void;
  onNavigate: (page: PageId) => void;
}

export const RecipeDetailsPage: React.FC<RecipeDetailsPageProps> = ({
  recipe,
  customReviews,
  isFavourite,
  onBack,
  onToggleFavourite,
  onAddIngredientsToShoppingList,
  onMarkCooked,
  onAddReview,
  onNavigate,
}) => {
  const [servings, setServings] = useState(recipe.servings);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [shoppingAdded, setShoppingAdded] = useState(false);
  const [cookedLogged, setCookedLogged] = useState(false);

  // Interactive Cooking Timer
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(
    (recipe.instructions[0]?.timerMinutes || 10) * 60
  );
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(
    (recipe.instructions[0]?.timerMinutes || 10) * 60
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeTimerLabel, setActiveTimerLabel] = useState(
    `Step 1: ${recipe.instructions[0]?.title || 'Prep & Simmer'}`
  );

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setServings(recipe.servings);
    setCheckedSteps(new Set());
    const initSec = (recipe.instructions[0]?.timerMinutes || 10) * 60;
    setTimerSecondsLeft(initSec);
    setTimerTotalSeconds(initSec);
    setTimerRunning(false);
    setActiveTimerLabel(`Step 1: ${recipe.instructions[0]?.title || 'Cooking Timer'}`);
  }, [recipe]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const loadStepTimer = (minutes: number, label: string) => {
    const total = minutes * 60;
    setTimerTotalSeconds(total);
    setTimerSecondsLeft(total);
    setActiveTimerLabel(label);
    setTimerRunning(true);
  };

  const toggleStep = (stepNum: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });
  };

  const handleAddShopping = () => {
    onAddIngredientsToShoppingList(recipe, servings);
    setShoppingAdded(true);
    setTimeout(() => setShoppingAdded(false), 3500);
  };

  const handleMarkCooked = () => {
    onMarkCooked(recipe.id, `Cooked ${servings} servings at home.`, 5);
    setCookedLogged(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Please write a short note about how the dish turned out.');
      return;
    }
    setReviewError('');
    onAddReview(recipe.id, reviewRating, reviewComment.trim());
    setReviewComment('');
  };

  const allReviews = [...customReviews, ...recipe.reviews];

  return (
    <div className="space-y-10">
      {/* Back breadcrumb */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Recipes</span>
      </button>

      {/* Top Recipe Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 aspect-[4/3]">
          <DishVisual style={recipe.visualStyle} title={recipe.title} className="w-full h-full" />
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="text-xs font-medium text-orange-700 dark:text-orange-400">
            {recipe.region} · {recipe.diet} · {recipe.spiceLevel} Spice
          </div>

          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-1">
              {recipe.title}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">{recipe.hindiName}</p>
          </div>

          <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed">
            {recipe.description}
          </p>

          {/* Clean unboxed metrics bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-stone-200 dark:border-stone-800 tabular-nums">
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">Total Time</p>
              <p className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                {recipe.totalTimeMinutes} mins
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">Difficulty</p>
              <p className="text-base font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {recipe.difficulty}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">Nutrition / Serving</p>
              <p className="text-base font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                {recipe.calories} kcal · {recipe.proteinGrams}g protein
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">Rating</p>
              <p className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {recipe.rating.toFixed(1)}{' '}
                <span className="text-xs font-normal text-stone-500">
                  ({recipe.reviewCount + customReviews.length})
                </span>
              </p>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleFavourite(recipe.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                isFavourite
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300'
                  : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
              <span>{isFavourite ? 'Saved in Favourites' : 'Save Recipe'}</span>
            </button>

            <button
              type="button"
              onClick={handleAddShopping}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{shoppingAdded ? 'Added to Shopping List!' : 'Add to Shopping List'}</span>
            </button>

            <button
              type="button"
              onClick={handleMarkCooked}
              disabled={cookedLogged}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-white disabled:opacity-70 transition-colors whitespace-nowrap cursor-pointer"
            >
              <ChefHat className="w-4 h-4" />
              <span>{cookedLogged ? 'Logged in Cooking History' : 'Mark as Cooked'}</span>
            </button>
          </div>

          {shoppingAdded && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Ingredients added!{' '}
              <button
                type="button"
                onClick={() => onNavigate('shopping-list')}
                className="underline font-semibold cursor-pointer"
              >
                Open Shopping List
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Main Two-Column Cooking Workspace: Ingredients + Timer Left, Instructions Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Ingredients & Interactive Kitchen Timer */}
        <div className="lg:col-span-5 space-y-6">
          <section className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                Ingredients
              </h2>

              <div className="flex items-center gap-2 text-sm tabular-nums">
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  aria-label="Decrease servings"
                  className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold min-w-[76px] text-center">
                  {servings} {servings === 1 ? 'serving' : 'servings'}
                </span>
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.min(12, s + 1))}
                  aria-label="Increase servings"
                  className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <ul className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="py-2.5 flex items-center justify-between gap-4">
                  <span className="text-stone-800 dark:text-stone-200">{ing.name}</span>
                  <span className="font-mono-num text-xs font-medium text-stone-600 dark:text-stone-400 shrink-0">
                    {scaleIngredientAmount(ing.amount, recipe.servings, servings)}
                  </span>
                </li>
              ))}
            </ul>

            {recipe.allergens.length > 0 && (
              <p className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
                Allergen note: Contains {recipe.allergens.join(', ')}.
              </p>
            )}
          </section>

          {/* Interactive Cooking Timer */}
          <section
            aria-labelledby="kitchen-timer-heading"
            className="p-6 rounded-xl bg-stone-900 text-white border border-stone-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                <h2 id="kitchen-timer-heading" className="text-sm font-semibold font-sans">
                  Kitchen Timer
                </h2>
              </div>
              <span className="text-xs text-stone-400 truncate max-w-[180px]">
                {activeTimerLabel}
              </span>
            </div>

            <div className="text-center py-2">
              <p className="font-mono-num text-4xl font-bold tracking-wider text-amber-300">
                {formatTimer(timerSecondsLeft)}
              </p>
              {timerSecondsLeft === 0 && (
                <p className="text-xs text-emerald-400 mt-1 font-medium">
                  Timer complete — check your pan!
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-700 hover:bg-orange-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{timerRunning ? 'Pause' : 'Start Timer'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSecondsLeft(timerTotalSeconds);
                }}
                aria-label="Reset timer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-stone-800 text-xs">
              {[2, 5, 10, 15].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerTotalSeconds(m * 60);
                    setTimerSecondsLeft(m * 60);
                    setActiveTimerLabel(`${m} min preset`);
                  }}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 tabular-nums cursor-pointer"
                >
                  {m}m
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Step-by-Step Instructions & Chef Tip */}
        <div className="lg:col-span-7 space-y-6">
          <section className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-6">
            <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
              Step-by-Step Instructions
            </h2>

            <ol className="space-y-5">
              {recipe.instructions.map((inst) => {
                const done = checkedSteps.has(inst.step);
                return (
                  <li
                    key={inst.step}
                    className={`p-4 rounded-xl border transition-colors ${
                      done
                        ? 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-75'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => toggleStep(inst.step)}
                          aria-label={`Mark step ${inst.step} as ${done ? 'incomplete' : 'complete'}`}
                          className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                            done
                              ? 'bg-emerald-700 text-white'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-orange-100'
                          }`}
                        >
                          {done ? <Check className="w-3.5 h-3.5" /> : inst.step}
                        </button>
                        <div>
                          <h3
                            className={`text-base font-semibold font-sans ${
                              done
                                ? 'line-through text-stone-500'
                                : 'text-stone-900 dark:text-stone-100'
                            }`}
                          >
                            {inst.title}
                          </h3>
                          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                            {inst.detail}
                          </p>
                        </div>
                      </div>

                      {inst.timerMinutes && (
                        <button
                          type="button"
                          onClick={() =>
                            loadStepTimer(inst.timerMinutes!, `Step ${inst.step}: ${inst.title}`)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 text-xs font-medium hover:bg-orange-100 transition-colors shrink-0 tabular-nums cursor-pointer"
                        >
                          <Timer className="w-3.5 h-3.5" />
                          <span>{inst.timerMinutes}m</span>
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
                Rasoi Tip
              </p>
              <p className="text-sm text-stone-700 dark:text-stone-300">{recipe.tips}</p>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-6">
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
              Home Cook Reviews ({allReviews.length})
            </h2>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="flex items-center gap-3">
                <label htmlFor="review-rating-select" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Your Rating:
                </label>
                <select
                  id="review-rating-select"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value={5}>5 Stars — Excellent</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Good</option>
                </select>
              </div>

              <div>
                <label htmlFor="review-comment-input" className="sr-only">
                  Share your cooking notes or review
                </label>
                <textarea
                  id="review-comment-input"
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Did you try this recipe? Share spice tweaks or tips for fellow cooks..."
                  className="w-full p-3 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-700"
                />
                {reviewError && <p className="text-xs text-red-600 mt-1">{reviewError}</p>}
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
              >
                Post Review
              </button>
            </form>

            {allReviews.length > 0 ? (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800 space-y-3 pt-2">
                {allReviews.map((rev) => (
                  <li key={rev.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {rev.author}
                      </span>
                      <span className="text-stone-500 tabular-nums">
                        {'★'.repeat(rev.rating)} · {rev.date}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">{rev.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Be the first home cook to leave a note on {recipe.title}.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

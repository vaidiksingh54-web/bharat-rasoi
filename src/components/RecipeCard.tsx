import React from 'react';
import { Clock, Heart, Star } from 'lucide-react';
import { Recipe } from '../types';
import { DishVisual } from './DishVisual';

interface RecipeCardProps {
  recipe: Recipe;
  isFavourite: boolean;
  onSelect: (recipeId: string) => void;
  onToggleFavourite: (recipeId: string) => void;
  subtitleNote?: string;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavourite,
  onSelect,
  onToggleFavourite,
  subtitleNote,
}) => {
  const isVegLike = recipe.diet === 'Vegetarian' || recipe.diet === 'Vegan';

  return (
    <article className="group flex flex-col bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-xl overflow-hidden transition-transform duration-150 hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <button
          type="button"
          onClick={() => onSelect(recipe.id)}
          className="block w-full h-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          aria-label={`Open recipe for ${recipe.title}`}
        >
          <DishVisual style={recipe.visualStyle} title={recipe.title} className="w-full h-full" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite(recipe.id);
          }}
          aria-label={
            isFavourite
              ? `Remove ${recipe.title} from favourites`
              : `Save ${recipe.title} to favourites`
          }
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-xs cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavourite ? 'fill-red-600 text-red-600 dark:fill-red-500 dark:text-red-500' : ''
            }`}
          />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-4">
        {subtitleNote ? (
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
            {subtitleNote}
          </p>
        ) : (
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">
            {recipe.region}
            <span aria-hidden="true"> · </span>
            <span className={isVegLike ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
              {recipe.diet}
            </span>
          </p>
        )}

        <h3 className="text-lg font-semibold leading-snug text-stone-900 dark:text-stone-100 mb-1.5">
          <button
            type="button"
            onClick={() => onSelect(recipe.id)}
            className="text-left hover:text-orange-700 dark:hover:text-orange-400 transition-colors cursor-pointer"
          >
            {recipe.title}
          </button>
        </h3>

        <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 flex-1">
          {recipe.description}
        </p>

        {/* Clean GoodFood-inspired unboxed metadata footer */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 tabular-nums">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />
            <span>{recipe.totalTimeMinutes} mins</span>
            <span aria-hidden="true">·</span>
            <span>{recipe.difficulty}</span>
          </div>

          <div className="flex items-center gap-1 font-medium text-stone-800 dark:text-stone-200">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />
            <span>{recipe.rating.toFixed(1)}</span>
            <span className="text-stone-400 font-normal">({recipe.reviewCount})</span>
          </div>
        </div>
      </div>
    </article>
  );
};

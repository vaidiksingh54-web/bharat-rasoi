import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { CookingLesson, ExperienceLevel, Recipe } from '../types';
import { COOKING_LESSONS } from '../data/recipes';

interface LearnCookingPageProps {
  recipes: Recipe[];
  completedLessonIds: string[];
  onToggleCompleteLesson: (lessonId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
}

export const LearnCookingPage: React.FC<LearnCookingPageProps> = ({
  recipes,
  completedLessonIds,
  onToggleCompleteLesson,
  onSelectRecipe,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | 'All'>('All');
  const [activeLessonId, setActiveLessonId] = useState<string>(COOKING_LESSONS[0].id);

  const visibleLessons = COOKING_LESSONS.filter(
    (l) => selectedLevel === 'All' || l.level === selectedLevel
  );

  const activeLesson: CookingLesson =
    visibleLessons.find((l) => l.id === activeLessonId) ||
    visibleLessons[0] ||
    COOKING_LESSONS[0];

  const practiceRecipe = recipes.find((r) => r.id === activeLesson.practiceRecipeId);
  const isCompleted = completedLessonIds.includes(activeLesson.id);
  const progressPct = Math.round(
    (completedLessonIds.length / COOKING_LESSONS.length) * 100
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
            Structured Culinary Curriculum
          </p>
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Learn Indian Cooking
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            Progress from mastering your masala dabba and tadka basics to regional batter fermentation and slow dum cooking.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 min-w-[230px]">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 tabular-nums">
            <span>Curriculum Progress</span>
            <span>
              {completedLessonIds.length}/{COOKING_LESSONS.length} ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-emerald-700 transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Level Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => setSelectedLevel(lvl)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              selectedLevel === lvl
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            {lvl === 'All' ? 'All Skill Levels' : lvl}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lesson List */}
        <div className="lg:col-span-5 space-y-3">
          {visibleLessons.map((lesson) => {
            const done = completedLessonIds.includes(lesson.id);
            const active = lesson.id === activeLesson.id;

            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setActiveLessonId(lesson.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  active
                    ? 'bg-orange-50/70 dark:bg-orange-950/40 border-orange-700 dark:border-orange-500'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1 tabular-nums">
                  <span>
                    {lesson.level} · {lesson.category} · {lesson.durationMinutes} min
                  </span>
                  {done && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Done
                    </span>
                  )}
                </div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 font-sans">
                  {lesson.title}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
                  {lesson.summary}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Lesson Reader */}
        <article className="lg:col-span-7 p-6 sm:p-8 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1 tabular-nums">
                {activeLesson.level} Track · <Clock className="w-3 h-3 inline -mt-0.5" />{' '}
                {activeLesson.durationMinutes} min study
              </p>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
                {activeLesson.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onToggleCompleteLesson(activeLesson.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Mark Lesson Complete'}</span>
            </button>
          </div>

          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            {activeLesson.summary}
          </p>

          <div className="space-y-4">
            {activeLesson.steps.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800"
              >
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-sans mb-1">
                  {s.heading}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-sans mb-2">
              Key Kitchen Takeaways
            </h3>
            <ul className="space-y-2 text-sm text-stone-700 dark:text-stone-300 list-disc pl-5">
              {activeLesson.keyTakeaways.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>

          {practiceRecipe && (
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Recommended Practice Dish
                </p>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {practiceRecipe.title} ({practiceRecipe.totalTimeMinutes} mins ·{' '}
                  {practiceRecipe.difficulty})
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectRecipe(practiceRecipe.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Practice with Recipe</span>
              </button>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

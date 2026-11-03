import { useEffect, useMemo, useState } from 'react';
import {
  AppDatabaseState,
  DayOfWeek,
  GroceryCategory,
  IndianRegion,
  IngredientItem,
  PageId,
  Recipe,
  UserAccount,
  UserPreferences,
  UserSettings,
} from './types';
import { INITIAL_DATABASE_STATE, RECIPES } from './data/recipes';
import {
  buildPreferenceSignature,
  generateDailyRecommendations,
  getAlternativeRecipeForSlot,
  getTodayDateString,
  mergeIngredientsIntoShoppingList,
  scaleIngredientAmount,
} from './utils/recommendationEngine';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExploreFilters, ExploreRecipesPage } from './pages/ExploreRecipesPage';
import { TodaysFoodPage } from './pages/TodaysFoodPage';
import { RecipeDetailsPage } from './pages/RecipeDetailsPage';
import { LearnCookingPage } from './pages/LearnCookingPage';
import { AIChefPage } from './pages/AIChefPage';
import { IngredientFinderPage } from './pages/IngredientFinderPage';
import { FavouritesPage } from './pages/FavouritesPage';
import {
  CookingHistoryPage,
  MealPlannerPage,
  ShoppingListPage,
} from './pages/KitchenToolsPages';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import {
  LoginPage,
  RegisterPage,
  SettingsPage,
} from './pages/AccountAndAuthPages';

const STORAGE_KEY = 'bharat_rasoi_state_v1';

const DEFAULT_EXPLORE_FILTERS: ExploreFilters = {
  query: '',
  region: 'All',
  mealCategory: 'All',
  diet: 'All',
  difficulty: 'All',
  maxTime: null,
  sortBy: 'popular',
};

function loadInitialState(): AppDatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppDatabaseState;
      return {
        ...INITIAL_DATABASE_STATE,
        ...parsed,
      };
    }
  } catch {
    // Fallback to default seed
  }
  return INITIAL_DATABASE_STATE;
}

export default function App() {
  const [db, setDb] = useState<AppDatabaseState>(() => loadInitialState());
  const [activePage, setActivePage] = useState<PageId>('home');
  const [previousPage, setPreviousPage] = useState<PageId>('home');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(RECIPES[0].id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreFilters, setExploreFilters] = useState<ExploreFilters>(
    DEFAULT_EXPLORE_FILTERS
  );

  const todayStr = getTodayDateString();
  const currentPrefSig = buildPreferenceSignature(db.preferences);

  // Ensure today's recommendation set is generated once & saved consistently throughout the day
  const todaysSet = useMemo(() => {
    const existing = db.dailyRecommendations[todayStr];
    if (existing && existing.preferenceSignature === currentPrefSig) {
      return existing;
    }
    const previousIds = Object.entries(db.dailyRecommendations)
      .filter(([dt]) => dt !== todayStr)
      .flatMap(([, s]) => [s.breakfastId, s.lunchId, s.snacksId, s.dinnerId]);

    return generateDailyRecommendations(
      RECIPES,
      todayStr,
      db.preferences,
      previousIds,
      existing?.surpriseSeed || 0
    );
  }, [db.dailyRecommendations, db.preferences, todayStr, currentPrefSig]);

  // Persist generated daily set into state if missing or preference signature changed
  useEffect(() => {
    const existing = db.dailyRecommendations[todayStr];
    if (!existing || existing.preferenceSignature !== currentPrefSig) {
      setDb((prev) => ({
        ...prev,
        dailyRecommendations: {
          ...prev.dailyRecommendations,
          [todayStr]: todaysSet,
        },
      }));
    }
  }, [todayStr, currentPrefSig, todaysSet, db.dailyRecommendations]);

  // Sync theme to document root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', db.settings.theme === 'dark');
  }, [db.settings.theme]);

  // Persist to localStorage & backend API
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignore quota errors
    }

    const userId = db.currentUser?.id || 'guest';
    fetch(`/api/state/${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: db }),
    }).catch(() => {
      // Non-blocking sync
    });
  }, [db]);

  const favouriteIds = useMemo(
    () => new Set(db.favourites.map((f) => f.recipeId)),
    [db.favourites]
  );

  const navigateTo = (page: PageId) => {
    setPreviousPage(activePage);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleSelectRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setPreviousPage(activePage === 'recipe-details' ? previousPage : activePage);
    setActivePage('recipe-details');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    // Record in recipe_views
    setDb((prev) => {
      const filtered = prev.recipeViews.filter((v) => v.recipeId !== recipeId);
      return {
        ...prev,
        recipeViews: [
          { recipeId, viewedAt: new Date().toISOString() },
          ...filtered,
        ].slice(0, 12),
      };
    });
  };

  const handleToggleFavourite = (recipeId: string) => {
    setDb((prev) => {
      const exists = prev.favourites.some((f) => f.recipeId === recipeId);
      if (exists) {
        return {
          ...prev,
          favourites: prev.favourites.filter((f) => f.recipeId !== recipeId),
        };
      }
      return {
        ...prev,
        favourites: [
          {
            recipeId,
            savedAt: new Date().toISOString(),
            collectionIds: [],
          },
          ...prev.favourites,
        ],
      };
    });
  };

  const handleHeaderOrHeroSearch = (query: string) => {
    setExploreFilters({
      ...DEFAULT_EXPLORE_FILTERS,
      query,
    });
    navigateTo('explore');
  };

  const handleExploreRegion = (region: IndianRegion) => {
    setExploreFilters({
      ...DEFAULT_EXPLORE_FILTERS,
      region,
    });
    navigateTo('explore');
  };

  const handleExploreBeginner = () => {
    setExploreFilters({
      ...DEFAULT_EXPLORE_FILTERS,
      difficulty: 'Easy',
      maxTime: 30,
    });
    navigateTo('explore');
  };

  // Today's Food Handlers
  const handleSwapTodaysSlot = (slot: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner') => {
    const currentId =
      slot === 'Breakfast'
        ? todaysSet.breakfastId
        : slot === 'Lunch'
        ? todaysSet.lunchId
        : slot === 'Snacks'
        ? todaysSet.snacksId
        : todaysSet.dinnerId;

    const exclude = [
      todaysSet.breakfastId,
      todaysSet.lunchId,
      todaysSet.snacksId,
      todaysSet.dinnerId,
    ];

    const alt = getAlternativeRecipeForSlot(
      RECIPES,
      slot,
      db.preferences,
      currentId,
      exclude
    );
    if (!alt) return;

    const updated = {
      ...todaysSet,
      ...(slot === 'Breakfast' ? { breakfastId: alt.id } : {}),
      ...(slot === 'Lunch' ? { lunchId: alt.id } : {}),
      ...(slot === 'Snacks' ? { snacksId: alt.id } : {}),
      ...(slot === 'Dinner' ? { dinnerId: alt.id } : {}),
    };

    setDb((prev) => ({
      ...prev,
      dailyRecommendations: {
        ...prev.dailyRecommendations,
        [todayStr]: updated,
      },
    }));
  };

  const handleSurpriseMe = () => {
    const nextSeed = (todaysSet.surpriseSeed || 0) + 1;
    const nextSet = generateDailyRecommendations(
      RECIPES,
      todayStr,
      db.preferences,
      [todaysSet.breakfastId, todaysSet.lunchId, todaysSet.snacksId, todaysSet.dinnerId],
      nextSeed
    );

    setDb((prev) => ({
      ...prev,
      dailyRecommendations: {
        ...prev.dailyRecommendations,
        [todayStr]: nextSet,
      },
    }));
  };

  const handleGenerateShoppingFromRecipeIds = (recipeIds: string[]) => {
    const incoming: { item: IngredientItem; recipeTitle?: string }[] = [];
    for (const id of recipeIds) {
      const r = RECIPES.find((rec) => rec.id === id);
      if (!r) continue;
      for (const ing of r.ingredients) {
        incoming.push({ item: ing, recipeTitle: r.title });
      }
    }
    setDb((prev) => ({
      ...prev,
      shoppingList: mergeIngredientsIntoShoppingList(prev.shoppingList, incoming),
    }));
  };

  const handleAddRecipeIngredientsScaled = (recipe: Recipe, servings: number) => {
    const incoming = recipe.ingredients.map((ing) => ({
      item: {
        ...ing,
        amount: scaleIngredientAmount(ing.amount, recipe.servings, servings),
      },
      recipeTitle: recipe.title,
    }));
    setDb((prev) => ({
      ...prev,
      shoppingList: mergeIngredientsIntoShoppingList(prev.shoppingList, incoming),
    }));
  };

  const handleMarkCooked = (recipeId: string, notes: string, rating: number) => {
    setDb((prev) => ({
      ...prev,
      cookingHistory: [
        {
          id: `cook-${Date.now()}`,
          recipeId,
          cookedAt: new Date().toISOString(),
          notes,
          rating,
        },
        ...prev.cookingHistory,
      ],
    }));
  };

  const handleAddReview = (recipeId: string, rating: number, comment: string) => {
    const author = db.currentUser?.name || 'Home Cook';
    setDb((prev) => ({
      ...prev,
      customReviews: {
        ...prev.customReviews,
        [recipeId]: [
          {
            id: `rev-${Date.now()}`,
            author,
            rating,
            comment,
            date: getTodayDateString(),
          },
          ...(prev.customReviews[recipeId] || []),
        ],
      },
    }));
  };

  // Favourites Collections
  const handleCreateCollection = (name: string) => {
    setDb((prev) => ({
      ...prev,
      collections: [
        ...prev.collections,
        {
          id: `col-${Date.now()}`,
          name,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  };

  const handleToggleRecipeCollection = (recipeId: string, collectionId: string) => {
    setDb((prev) => ({
      ...prev,
      favourites: prev.favourites.map((fav) => {
        if (fav.recipeId !== recipeId) return fav;
        const has = fav.collectionIds.includes(collectionId);
        return {
          ...fav,
          collectionIds: has
            ? fav.collectionIds.filter((c) => c !== collectionId)
            : [...fav.collectionIds, collectionId],
        };
      }),
    }));
  };

  // Meal Planner
  const handleAssignMeal = (
    day: DayOfWeek,
    mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner',
    recipeId: string
  ) => {
    setDb((prev) => {
      const rest = prev.mealPlan.filter(
        (m) => !(m.day === day && m.mealType === mealType)
      );
      return {
        ...prev,
        mealPlan: [
          ...rest,
          {
            id: `mp-${day}-${mealType}-${Date.now()}`,
            day,
            mealType,
            recipeId,
          },
        ],
      };
    });
  };

  const handleAutoFillWeek = () => {
    const days: DayOfWeek[] = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const generatedEntries: AppDatabaseState['mealPlan'] = [];
    const usedIds: string[] = [];

    days.forEach((day, idx) => {
      const fakeDate = `2026-11-${String(2 + idx).padStart(2, '0')}`;
      const set = generateDailyRecommendations(
        RECIPES,
        fakeDate,
        db.preferences,
        usedIds.slice(-6),
        idx
      );
      usedIds.push(set.breakfastId, set.lunchId, set.dinnerId);
      generatedEntries.push(
        { id: `mp-${day}-b`, day, mealType: 'Breakfast', recipeId: set.breakfastId },
        { id: `mp-${day}-l`, day, mealType: 'Lunch', recipeId: set.lunchId },
        { id: `mp-${day}-s`, day, mealType: 'Snacks', recipeId: set.snacksId },
        { id: `mp-${day}-d`, day, mealType: 'Dinner', recipeId: set.dinnerId }
      );
    });

    setDb((prev) => ({
      ...prev,
      mealPlan: generatedEntries,
    }));
  };

  // Profile & Auth
  const handleSaveProfile = (
    updatedUser: { name: string; email: string; avatarUrl: string },
    updatedPrefs: UserPreferences
  ) => {
    setDb((prev) => ({
      ...prev,
      isNewUserOnboarding: false,
      currentUser: prev.currentUser
        ? { ...prev.currentUser, ...updatedUser }
        : {
            id: `user-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...updatedUser,
          },
      preferences: updatedPrefs,
    }));
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setDb((prev) => ({
      ...prev,
      currentUser: user,
      isNewUserOnboarding: false,
    }));
    navigateTo('dashboard');
  };

  const handleRegisterSuccess = (user: UserAccount) => {
    setDb((prev) => ({
      ...prev,
      currentUser: user,
      isNewUserOnboarding: true,
    }));
    // Direct new registrant straight to Cooking Profile setup!
    navigateTo('profile');
  };

  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    setDb((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...partial,
      },
    }));
  };

  const selectedRecipe =
    RECIPES.find((r) => r.id === selectedRecipeId) || RECIPES[0];

  const uncheckedShoppingCount = db.shoppingList.filter((i) => !i.checked).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Sidebar
        activePage={activePage}
        onNavigate={navigateTo}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        currentUser={db.currentUser}
        favouriteCount={db.favourites.length}
        shoppingCount={uncheckedShoppingCount}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={navigateTo}
          onSearchSubmit={handleHeaderOrHeroSearch}
          currentUser={db.currentUser}
          searchQuery={exploreFilters.query}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {activePage === 'home' && (
            <HomePage
              recipes={RECIPES}
              todaysSet={todaysSet}
              favouriteIds={favouriteIds}
              onSelectRecipe={handleSelectRecipe}
              onToggleFavourite={handleToggleFavourite}
              onNavigate={navigateTo}
              onSearchSubmit={handleHeaderOrHeroSearch}
              onExploreRegion={handleExploreRegion}
              onExploreBeginner={handleExploreBeginner}
            />
          )}

          {activePage === 'explore' && (
            <ExploreRecipesPage
              recipes={RECIPES}
              filters={exploreFilters}
              onChangeFilters={(partial) =>
                setExploreFilters((prev) => ({ ...prev, ...partial }))
              }
              onResetFilters={() => setExploreFilters(DEFAULT_EXPLORE_FILTERS)}
              favouriteIds={favouriteIds}
              onSelectRecipe={handleSelectRecipe}
              onToggleFavourite={handleToggleFavourite}
            />
          )}

          {activePage === 'todays-food' && (
            <TodaysFoodPage
              recipes={RECIPES}
              todaysSet={todaysSet}
              preferences={db.preferences}
              favouriteIds={favouriteIds}
              onSelectRecipe={handleSelectRecipe}
              onToggleFavourite={handleToggleFavourite}
              onSwapSlot={handleSwapTodaysSlot}
              onSurpriseMe={handleSurpriseMe}
              onGenerateShoppingList={handleGenerateShoppingFromRecipeIds}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'recipe-details' && (
            <RecipeDetailsPage
              recipe={selectedRecipe}
              customReviews={db.customReviews[selectedRecipe.id] || []}
              isFavourite={favouriteIds.has(selectedRecipe.id)}
              onBack={() =>
                navigateTo(
                  previousPage === 'recipe-details' ? 'explore' : previousPage
                )
              }
              onToggleFavourite={handleToggleFavourite}
              onAddIngredientsToShoppingList={handleAddRecipeIngredientsScaled}
              onMarkCooked={handleMarkCooked}
              onAddReview={handleAddReview}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'learn-cooking' && (
            <LearnCookingPage
              recipes={RECIPES}
              completedLessonIds={db.completedLessonIds}
              onToggleCompleteLesson={(lessonId) =>
                setDb((prev) => ({
                  ...prev,
                  completedLessonIds: prev.completedLessonIds.includes(lessonId)
                    ? prev.completedLessonIds.filter((id) => id !== lessonId)
                    : [...prev.completedLessonIds, lessonId],
                }))
              }
              onSelectRecipe={handleSelectRecipe}
            />
          )}

          {activePage === 'ai-chef' && (
            <AIChefPage
              preferences={db.preferences}
              onAddSuggestedShoppingItems={(names) => {
                const incoming = names.map((name) => ({
                  item: {
                    name,
                    amount: '1 unit',
                    category: 'Produce & Herbs' as GroceryCategory,
                  },
                  recipeTitle: 'AI Chef Suggestion',
                }));
                setDb((prev) => ({
                  ...prev,
                  shoppingList: mergeIngredientsIntoShoppingList(
                    prev.shoppingList,
                    incoming
                  ),
                }));
              }}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'ingredient-finder' && (
            <IngredientFinderPage
              recipes={RECIPES}
              defaultDiet={db.preferences.foodPreference}
              onSelectRecipe={handleSelectRecipe}
              onAddMissingIngredients={(items, recipeTitle) => {
                const incoming = items.map((item) => ({ item, recipeTitle }));
                setDb((prev) => ({
                  ...prev,
                  shoppingList: mergeIngredientsIntoShoppingList(
                    prev.shoppingList,
                    incoming
                  ),
                }));
              }}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'favourites' && (
            <FavouritesPage
              recipes={RECIPES}
              favourites={db.favourites}
              collections={db.collections}
              onSelectRecipe={handleSelectRecipe}
              onRemoveFavourite={handleToggleFavourite}
              onCreateCollection={handleCreateCollection}
              onToggleRecipeCollection={handleToggleRecipeCollection}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'meal-planner' && (
            <MealPlannerPage
              recipes={RECIPES}
              mealPlan={db.mealPlan}
              onAssignMeal={handleAssignMeal}
              onRemoveMeal={(entryId) =>
                setDb((prev) => ({
                  ...prev,
                  mealPlan: prev.mealPlan.filter((m) => m.id !== entryId),
                }))
              }
              onAutoFillWeek={handleAutoFillWeek}
              onExportWeekToShoppingList={() =>
                handleGenerateShoppingFromRecipeIds(
                  db.mealPlan.map((m) => m.recipeId)
                )
              }
              onSelectRecipe={handleSelectRecipe}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'shopping-list' && (
            <ShoppingListPage
              items={db.shoppingList}
              onAddItem={(name, amount, category) =>
                setDb((prev) => ({
                  ...prev,
                  shoppingList: [
                    {
                      id: `shop-${Date.now()}`,
                      name,
                      amount,
                      category,
                      checked: false,
                    },
                    ...prev.shoppingList,
                  ],
                }))
              }
              onToggleItem={(id) =>
                setDb((prev) => ({
                  ...prev,
                  shoppingList: prev.shoppingList.map((i) =>
                    i.id === id ? { ...i, checked: !i.checked } : i
                  ),
                }))
              }
              onDeleteItem={(id) =>
                setDb((prev) => ({
                  ...prev,
                  shoppingList: prev.shoppingList.filter((i) => i.id !== id),
                }))
              }
              onClearChecked={() =>
                setDb((prev) => ({
                  ...prev,
                  shoppingList: prev.shoppingList.filter((i) => !i.checked),
                }))
              }
            />
          )}

          {activePage === 'cooking-history' && (
            <CookingHistoryPage
              recipes={RECIPES}
              cookingHistory={db.cookingHistory}
              recipeViews={db.recipeViews}
              onSelectRecipe={handleSelectRecipe}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'dashboard' && (
            <DashboardPage
              currentUser={db.currentUser}
              preferences={db.preferences}
              recipes={RECIPES}
              todaysSet={todaysSet}
              favourites={db.favourites}
              recipeViews={db.recipeViews}
              cookingHistory={db.cookingHistory}
              mealPlan={db.mealPlan}
              shoppingList={db.shoppingList}
              completedLessonIds={db.completedLessonIds}
              onSelectRecipe={handleSelectRecipe}
              onToggleShoppingItem={(id) =>
                setDb((prev) => ({
                  ...prev,
                  shoppingList: prev.shoppingList.map((i) =>
                    i.id === id ? { ...i, checked: !i.checked } : i
                  ),
                }))
              }
              onNavigate={navigateTo}
              onDemoSignIn={() =>
                handleLoginSuccess(INITIAL_DATABASE_STATE.currentUser!)
              }
            />
          )}

          {activePage === 'profile' && (
            <ProfilePage
              currentUser={db.currentUser}
              isOnboarding={db.isNewUserOnboarding}
              preferences={db.preferences}
              onSaveProfile={handleSaveProfile}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              currentUser={db.currentUser}
              settings={db.settings}
              notifications={db.notifications}
              onUpdateSettings={handleUpdateSettings}
              onMarkAllNotificationsRead={() =>
                setDb((prev) => ({
                  ...prev,
                  notifications: prev.notifications.map((n) => ({
                    ...n,
                    read: true,
                  })),
                }))
              }
              onSignOut={() => {
                setDb((prev) => ({ ...prev, currentUser: null }));
                navigateTo('login');
              }}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'login' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'register' && (
            <RegisterPage
              onRegisterSuccess={handleRegisterSuccess}
              onNavigate={navigateTo}
            />
          )}
        </main>

        <Footer onNavigate={navigateTo} onExploreRegion={handleExploreRegion} />
      </div>
    </div>
  );
}

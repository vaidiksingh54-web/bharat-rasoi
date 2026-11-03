import React, { useState } from 'react';
import { ChefHat, Menu, Search, User, X } from 'lucide-react';
import { PageId, UserAccount } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigate: (page: PageId) => void;
  onSearchSubmit: (query: string) => void;
  currentUser: UserAccount | null;
  searchQuery: string;
  sidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNavigate,
  onSearchSubmit,
  currentUser,
  searchQuery,
  sidebarCollapsed = false,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(localQuery.trim());
    setMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs border-b border-stone-200 dark:border-stone-800">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Mobile Menu + Brand Wordmark (hidden on lg when sidebar already shows brand) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden w-10 h-10 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 text-left cursor-pointer ${
              sidebarCollapsed ? '' : 'lg:hidden'
            }`}
          >
            <ChefHat
              className="w-5 h-5 text-orange-700 dark:text-orange-400 shrink-0"
              aria-hidden="true"
            />
            <span className="font-display text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap">
              Bharat Rasoi
            </span>
          </button>

          {!sidebarCollapsed && (
            <span className="hidden lg:inline-block text-xs font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
              Authentic Indian Recipes & Personal Kitchen
            </span>
          )}
        </div>

        {/* Zone 2: Desktop / Tablet Search Bar */}
        <form onSubmit={handleSubmit} className="hidden sm:block flex-1 max-w-xl" role="search">
          <label htmlFor="header-recipe-search" className="sr-only">
            Search Indian recipes, ingredients, or cuisines
          </label>
          <div className="relative flex items-center">
            <Search
              className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="header-recipe-search"
              type="search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search poha, paneer, dosa, regional dishes..."
              className="w-full pl-10 pr-20 py-2 text-sm bg-stone-100/90 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-700 focus:bg-white dark:focus:bg-stone-900 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-orange-700 dark:hover:text-orange-400 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </form>

        {/* Zone 3: Mobile Search Trigger + Login & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label={mobileSearchOpen ? 'Close search bar' : 'Open search bar'}
            className="sm:hidden w-10 h-10 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="hidden md:inline-flex text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors whitespace-nowrap cursor-pointer"
              >
                Switch Account
              </button>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                aria-label={`Open profile for ${currentUser.name}`}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="max-w-[84px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-orange-700 dark:hover:text-orange-400 transition-colors whitespace-nowrap cursor-pointer px-1"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="px-3 sm:px-4 py-2 rounded-lg bg-orange-700 text-white text-xs font-semibold hover:bg-orange-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Row */}
      {mobileSearchOpen && (
        <form
          onSubmit={handleSubmit}
          className="sm:hidden px-4 pb-3 pt-1 border-t border-stone-100 dark:border-stone-800 flex gap-2"
          role="search"
        >
          <label htmlFor="mobile-recipe-search" className="sr-only">
            Search Indian recipes
          </label>
          <input
            id="mobile-recipe-search"
            type="search"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search poha, paneer, dosa..."
            className="flex-1 px-3.5 py-2 text-sm rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-orange-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            Search
          </button>
        </form>
      )}
    </header>
  );
};

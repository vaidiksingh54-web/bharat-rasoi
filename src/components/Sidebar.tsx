import React from 'react';
import {
  BookOpen,
  Calendar,
  ChefHat,
  Compass,
  Flame,
  Heart,
  History,
  Home,
  LayoutDashboard,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { PageId, UserAccount } from '../types';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser: UserAccount | null;
  favouriteCount: number;
  shoppingCount: number;
}

interface NavGroup {
  heading: string;
  items: {
    id: PageId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  currentUser,
  favouriteCount,
  shoppingCount,
}) => {
  const navGroups: NavGroup[] = [
    {
      heading: 'Main Menu',
      items: [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'explore', label: 'Explore Recipes', icon: Compass },
        { id: 'todays-food', label: "Today's Food", icon: Flame },
        { id: 'learn-cooking', label: 'Learn Cooking', icon: BookOpen },
        { id: 'ai-chef', label: 'AI Chef', icon: Sparkles },
        { id: 'ingredient-finder', label: 'Ingredient Finder', icon: Search },
      ],
    },
    {
      heading: 'My Kitchen',
      items: [
        { id: 'favourites', label: 'Favourite Recipes', icon: Heart, count: favouriteCount },
        { id: 'meal-planner', label: 'Meal Planner', icon: Calendar },
        { id: 'shopping-list', label: 'Shopping List', icon: ShoppingBag, count: shoppingCount },
        { id: 'cooking-history', label: 'Cooking History', icon: History },
      ],
    },
    {
      heading: 'Account',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings },
        {
          id: activePage === 'register' ? 'register' : 'login',
          label: 'Login / Register',
          icon: LogIn,
        },
      ],
    },
  ];

  const handleSelect = (id: PageId) => {
    onNavigate(id);
    onCloseMobile();
  };

  const renderSidebarContent = (isMobileDrawer: boolean) => {
    const isSlim = !isMobileDrawer && collapsed;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800">
        {/* Brand Top */}
        <div
          className={`flex items-center h-16 px-4 border-b border-stone-200 dark:border-stone-800 ${
            isSlim ? 'justify-center' : 'justify-between'
          }`}
        >
          <button
            type="button"
            onClick={() => handleSelect('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-700 rounded-md"
            aria-label="Bharat Rasoi Home"
          >
            <span className="w-9 h-9 rounded-lg bg-orange-700 text-white flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5" aria-hidden="true" />
            </span>
            {!isSlim && (
              <span className="font-display text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap">
                Bharat Rasoi
              </span>
            )}
          </button>

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            !isSlim && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {isSlim && (
          <div className="px-2 pt-3 flex justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav aria-label="Primary Sidebar" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.heading}>
              {!isSlim && (
                <p className="px-3 mb-2 text-xs font-semibold text-stone-400 dark:text-stone-500">
                  {group.heading}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activePage === item.id ||
                    (item.label === 'Login / Register' &&
                      (activePage === 'login' || activePage === 'register'));

                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        title={isSlim ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center ${
                          isSlim ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                        } rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/70 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? 'text-orange-700 dark:text-orange-400'
                                : 'text-stone-400 dark:text-stone-500'
                            }`}
                          />
                          {!isSlim && <span className="truncate">{item.label}</span>}
                        </span>

                        {!isSlim && typeof item.count === 'number' && item.count > 0 && (
                          <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
                            {item.count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Signed-in Kitchen Footer */}
        {!isSlim && currentUser && (
          <div className="p-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => handleSelect('dashboard')}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-orange-700 text-white text-xs font-semibold flex items-center justify-center shrink-0 overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                  Personal Kitchen
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Fixed Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-30 transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

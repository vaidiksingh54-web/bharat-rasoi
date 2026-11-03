import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { IndianRegion, PageId } from '../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onExploreRegion: (region: IndianRegion) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onExploreRegion }) => {
  const [activeInfoTab, setActiveInfoTab] = useState<'about' | 'contact' | 'privacy' | null>(null);

  return (
    <footer className="mt-16 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Summary */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-orange-700 text-white flex items-center justify-center">
                <ChefHat className="w-4 h-4" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                Bharat Rasoi
              </span>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Celebrating everyday Indian home kitchens—from quick weekday poha to heirloom regional feasts.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3 font-sans">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('explore')}
                  className="hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                >
                  All Indian Recipes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('todays-food')}
                  className="hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                >
                  Today's Food Menu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('learn-cooking')}
                  className="hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                >
                  Learn Indian Cooking
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('ai-chef')}
                  className="hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                >
                  AI Chef Assistant
                </button>
              </li>
            </ul>
          </div>

          {/* Regional Cuisines */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3 font-sans">
              Regional Kitchens
            </h3>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              {(
                [
                  'North Indian',
                  'South Indian',
                  'West Indian',
                  'East Indian',
                  'Central Indian',
                  'Northeast Indian',
                ] as IndianRegion[]
              ).map((region) => (
                <li key={region}>
                  <button
                    type="button"
                    onClick={() => onExploreRegion(region)}
                    className="hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                  >
                    {region}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About, Contact & Privacy */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3 font-sans">
              Bharat Rasoi
            </h3>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveInfoTab(activeInfoTab === 'about' ? null : 'about')}
                  className="hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveInfoTab(activeInfoTab === 'contact' ? null : 'contact')}
                  className="hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                >
                  Contact Kitchen Desk
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveInfoTab(activeInfoTab === 'privacy' ? null : 'privacy')}
                  className="hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                >
                  Privacy & Terms
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer"
                >
                  Personal Kitchen Dashboard
                </button>
              </li>
            </ul>
          </div>
        </div>

        {activeInfoTab && (
          <div className="mt-8 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-sm text-stone-700 dark:text-stone-300 flex items-start justify-between gap-4">
            <div>
              {activeInfoTab === 'about' && (
                <p>
                  <strong>About Bharat Rasoi:</strong> Built for home cooks everywhere, Bharat Rasoi pairs tested regional Indian recipes—from North, South, East, West, Central, and Northeast kitchens—with personalized daily meal planning and an intelligent AI Chef.
                </p>
              )}
              {activeInfoTab === 'contact' && (
                <p>
                  <strong>Contact Us:</strong> Reach our recipe editorial & kitchen support desk at{' '}
                  <span className="font-medium">kitchen@bharatrasoi.in</span> for regional recipe submissions, allergen queries, or feedback.
                </p>
              )}
              {activeInfoTab === 'privacy' && (
                <p>
                  <strong>Privacy & Terms:</strong> Your dietary preferences, allergies, saved collections, and weekly meal plans are used strictly to tailor your Bharat Rasoi kitchen experience and are never sold or shared externally.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveInfoTab(null)}
              className="text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 shrink-0 cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <p>© {new Date().getFullYear()} Bharat Rasoi. Crafted for Indian home cooking.</p>
          <p>North · South · East · West · Central · Northeast</p>
        </div>
      </div>
    </footer>
  );
};

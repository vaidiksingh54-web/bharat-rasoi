import React, { useState } from 'react';
import { Check, Edit3, Upload, User } from 'lucide-react';
import {
  DietType,
  ExperienceLevel,
  IndianRegion,
  MealStyle,
  PageId,
  PreferredTime,
  SpiceLevel,
  UserAccount,
  UserPreferences,
} from '../types';

interface ProfilePageProps {
  currentUser: UserAccount | null;
  isOnboarding?: boolean;
  preferences: UserPreferences;
  onSaveProfile: (
    updatedUser: { name: string; email: string; avatarUrl: string },
    updatedPrefs: UserPreferences
  ) => void;
  onNavigate: (page: PageId) => void;
}

const ALLERGENS = [
  'Tree Nuts',
  'Peanuts',
  'Dairy',
  'Wheat',
  'Sesame',
  'Eggs',
  'Fish',
  'Mustard',
];

const DIET_OPTIONS: { value: DietType; desc: string }[] = [
  { value: 'Vegetarian', desc: 'Plant foods & dairy, no meat/fish/eggs' },
  { value: 'Non-vegetarian', desc: 'All regional vegetables, poultry & seafood' },
  { value: 'Vegan', desc: '100% plant-based, no dairy, ghee, or honey' },
  { value: 'Eggetarian', desc: 'Vegetarian foods plus egg dishes' },
];

const CUISINE_OPTIONS: (IndianRegion | 'All Regions')[] = [
  'North Indian',
  'South Indian',
  'West Indian',
  'East Indian',
  'Central Indian',
  'Northeast Indian',
  'All Regions',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  isOnboarding,
  preferences,
  onSaveProfile,
  onNavigate,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(Boolean(isOnboarding));
  const [savedNotice, setSavedNotice] = useState(false);

  const [name, setName] = useState(currentUser?.name || 'Guest Home Cook');
  const [email, setEmail] = useState(currentUser?.email || 'cook@bharatrasoi.in');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  const [foodPreference, setFoodPreference] = useState<DietType>(preferences.foodPreference);
  const [favouriteCuisine, setFavouriteCuisine] = useState<IndianRegion | 'All Regions'>(
    preferences.favouriteCuisine
  );
  const [dishesText, setDishesText] = useState(preferences.favouriteDishes.join(', '));
  const [spicePreference, setSpicePreference] = useState<SpiceLevel>(
    preferences.spicePreference
  );
  const [allergies, setAllergies] = useState<string[]>(preferences.allergies);
  const [cookingExperience, setCookingExperience] = useState<ExperienceLevel>(
    preferences.cookingExperience
  );
  const [preferredCookingTime, setPreferredCookingTime] = useState<PreferredTime>(
    preferences.preferredCookingTime
  );
  const [mealStyle, setMealStyle] = useState<MealStyle>(preferences.mealStyle);

  const toggleAllergen = (allergen: string) => {
    setAllergies((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDishes = dishesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSaveProfile(
      {
        name: name.trim() || 'Home Cook',
        email: email.trim() || 'cook@bharatrasoi.in',
        avatarUrl,
      },
      {
        foodPreference,
        favouriteCuisine,
        favouriteDishes: parsedDishes.length > 0 ? parsedDishes : ['Paneer', 'Poha'],
        spicePreference,
        allergies,
        cookingExperience,
        preferredCookingTime,
        mealStyle,
      }
    );
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {isOnboarding && (
        <div className="p-5 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 text-sm text-orange-950 dark:text-orange-200">
          <p className="font-semibold mb-1">Welcome to Bharat Rasoi! Set up your Cooking Profile</p>
          <p>
            Choose your dietary lifestyle, regional favourites, spice tolerance, and allergens below so Today's Food and AI Chef tailor every suggestion to you.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
            Personalization & Taste Profile
          </p>
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
            My Profile & Food Preferences
          </h1>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 transition-colors self-start cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {savedNotice && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4 text-sm text-emerald-900 dark:text-emerald-200"
        >
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>
              Your food preferences have been saved and Today's Food recommendations are updated!
            </span>
          </span>
          <button
            type="button"
            onClick={() => onNavigate('todays-food')}
            className="font-semibold underline whitespace-nowrap cursor-pointer"
          >
            See Today's Menu →
          </button>
        </div>
      )}

      {/* Read-Only Profile Summary View */}
      {!isEditing ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-stone-100 dark:border-stone-800">
            <div className="w-20 h-20 rounded-2xl bg-orange-700 text-white flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-9 h-9" />
              )}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
                {name}
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">{email}</p>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-1.5 font-medium">
                {preferences.foodPreference} · {preferences.favouriteCuisine} ·{' '}
                {preferences.mealStyle}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-xs text-stone-500 mb-1">Food Preference</dt>
              <dd className="font-semibold text-stone-900 dark:text-stone-100">
                {preferences.foodPreference}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500 mb-1">Favourite Cuisine</dt>
              <dd className="font-semibold text-stone-900 dark:text-stone-100">
                {preferences.favouriteCuisine}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500 mb-1">Favourite Dishes</dt>
              <dd className="font-semibold text-stone-900 dark:text-stone-100">
                {preferences.favouriteDishes.join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500 mb-1">Spice Preference</dt>
              <dd className="font-semibold text-stone-900 dark:text-stone-100">
                {preferences.spicePreference}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500 mb-1">Allergies</dt>
              <dd className="font-semibold text-stone-900 dark:text-stone-100">
                {preferences.allergies.length > 0
                  ? preferences.allergies.join(', ')
                  : 'No allergies'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500 mb-1">Cooking Experience</dt>
              <dd className="font-semibold text-stone-900 dark:text-stone-100">
                {preferences.cookingExperience}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500 mb-1">Preferred Cooking Time</dt>
              <dd className="font-semibold text-stone-900 dark:text-stone-100">
                {preferences.preferredCookingTime}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500 mb-1">Meal Style</dt>
              <dd className="font-semibold text-stone-900 dark:text-stone-100">
                {preferences.mealStyle}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        /* Interactive Edit Form */
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-8"
        >
          {/* Personal Info & Photo */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-6 border-b border-stone-100 dark:border-stone-800">
            <div className="md:col-span-3 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-7 h-7 text-stone-400" />
                )}
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="md:col-span-4">
              <label
                htmlFor="profile-name"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="md:col-span-5">
              <label
                htmlFor="profile-email"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Dietary Needs */}
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-sans mb-3">
              Dietary Preference
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DIET_OPTIONS.map((opt) => {
                const active = foodPreference === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFoodPreference(opt.value)}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-orange-700 bg-orange-50/70 dark:bg-orange-950/50'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {opt.value}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-sans">
                Allergies to Exclude
              </h2>
              <button
                type="button"
                onClick={() => setAllergies([])}
                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
              >
                No allergies (clear)
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((alg) => {
                const selected = allergies.includes(alg);
                return (
                  <button
                    key={alg}
                    type="button"
                    onClick={() => toggleAllergen(alg)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {selected ? `✓ ${alg}` : alg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuisine, Spice, Time, Experience, Meal Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label
                htmlFor="pref-cuisine"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Favourite Regional Cuisine
              </label>
              <select
                id="pref-cuisine"
                value={favouriteCuisine}
                onChange={(e) =>
                  setFavouriteCuisine(e.target.value as IndianRegion | 'All Regions')
                }
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              >
                {CUISINE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="pref-spice"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Spice Preference
              </label>
              <select
                id="pref-spice"
                value={spicePreference}
                onChange={(e) => setSpicePreference(e.target.value as SpiceLevel)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              >
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Spicy">Spicy</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="pref-experience"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Cooking Experience
              </label>
              <select
                id="pref-experience"
                value={cookingExperience}
                onChange={(e) => setCookingExperience(e.target.value as ExperienceLevel)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="pref-time"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Preferred Cooking Time
              </label>
              <select
                id="pref-time"
                value={preferredCookingTime}
                onChange={(e) => setPreferredCookingTime(e.target.value as PreferredTime)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              >
                <option value="Under 20 minutes">Under 20 minutes</option>
                <option value="Under 30 minutes">Under 30 minutes</option>
                <option value="30–45 minutes">30–45 minutes</option>
                <option value="Any duration">Any duration</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="pref-style"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Meal Style
              </label>
              <select
                id="pref-style"
                value={mealStyle}
                onChange={(e) => setMealStyle(e.target.value as MealStyle)}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              >
                <option value="Quick meals">Quick meals</option>
                <option value="Traditional meals">Traditional meals</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="pref-dishes"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Favourite Dishes (comma-separated)
              </label>
              <input
                id="pref-dishes"
                type="text"
                value={dishesText}
                onChange={(e) => setDishesText(e.target.value)}
                placeholder="Paneer, Dosa, Poha"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            {!isOnboarding && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-semibold cursor-pointer"
            >
              Save Food Preferences
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

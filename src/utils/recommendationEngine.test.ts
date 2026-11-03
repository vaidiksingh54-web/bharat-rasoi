import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDailyRecommendations,
  getAlternativeRecipeForSlot,
  isDietCompatible,
  matchRecipesByIngredients,
  scaleIngredientAmount,
} from './recommendationEngine';
import { Recipe, UserPreferences } from '../types';

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'veg-poha',
    title: 'Indori Vegetable Poha',
    hindiName: 'पोहा',
    description: 'Fluffy flattened rice tempered with mustard seeds and curry leaves.',
    region: 'Central Indian',
    mealCategories: ['Breakfast'],
    diet: 'Vegan',
    spiceLevel: 'Mild',
    difficulty: 'Easy',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    totalTimeMinutes: 20,
    servings: 2,
    calories: 260,
    proteinGrams: 6,
    carbsGrams: 46,
    fatGrams: 6,
    isBeginnerFriendly: true,
    allergens: ['Peanuts'],
    ingredients: [
      { name: 'Flattened Rice (Poha)', amount: '2 cups', category: 'Grains, Lentils & Oils' },
      { name: 'Onion', amount: '1 medium', category: 'Produce & Herbs' },
      { name: 'Roasted Peanuts', amount: '2 tbsp', category: 'Grains, Lentils & Oils' },
      { name: 'Turmeric Powder', amount: '1/2 tsp', category: 'Spices & Masalas' },
    ],
    instructions: [{ step: 1, title: 'Rinse poha', detail: 'Wash gently in colander.' }],
    tips: 'Do not soak poha in water.',
    rating: 4.9,
    reviewCount: 42,
    reviews: [],
    visualStyle: 'poha',
  },
  {
    id: 'idli-sambar',
    title: 'Steamed Idli & Sambar',
    hindiName: 'इडली सांभर',
    description: 'Soft fermented rice cakes with tangy lentil vegetable stew.',
    region: 'South Indian',
    mealCategories: ['Breakfast'],
    diet: 'Vegan',
    spiceLevel: 'Medium',
    difficulty: 'Easy',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    servings: 2,
    calories: 240,
    proteinGrams: 8,
    carbsGrams: 44,
    fatGrams: 3,
    isBeginnerFriendly: true,
    allergens: [],
    ingredients: [
      { name: 'Idli Batter', amount: '2 cups', category: 'Grains, Lentils & Oils' },
      { name: 'Toor Dal', amount: '1/2 cup', category: 'Grains, Lentils & Oils' },
    ],
    instructions: [{ step: 1, title: 'Steam idlis', detail: 'Steam for 10 mins.' }],
    tips: 'Grease moulds lightly.',
    rating: 4.8,
    reviewCount: 38,
    reviews: [],
    visualStyle: 'idli',
  },
  {
    id: 'egg-bhurji',
    title: 'Mumbai Masala Egg Bhurji',
    hindiName: 'अंडा भुर्जी',
    description: 'Spiced Indian scrambled eggs with tomatoes and pav.',
    region: 'West Indian',
    mealCategories: ['Breakfast', 'Dinner'],
    diet: 'Eggetarian',
    spiceLevel: 'Medium',
    difficulty: 'Easy',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    totalTimeMinutes: 15,
    servings: 2,
    calories: 310,
    proteinGrams: 18,
    carbsGrams: 8,
    fatGrams: 22,
    isBeginnerFriendly: true,
    allergens: ['Eggs'],
    ingredients: [
      { name: 'Eggs', amount: '4 large', category: 'Dairy & Protein' },
      { name: 'Onion', amount: '1 medium', category: 'Produce & Herbs' },
      { name: 'Tomato', amount: '1 medium', category: 'Produce & Herbs' },
    ],
    instructions: [{ step: 1, title: 'Scramble', detail: 'Cook eggs with masala.' }],
    tips: 'Keep eggs soft.',
    rating: 4.7,
    reviewCount: 25,
    reviews: [],
    visualStyle: 'egg-bhurji',
  },
  {
    id: 'dal-rice',
    title: 'Homestyle Dal Tadka & Jeera Rice',
    hindiName: 'दाल चावल',
    description: 'Comforting yellow lentils tempered with garlic and cumin.',
    region: 'North Indian',
    mealCategories: ['Lunch', 'Dinner'],
    diet: 'Vegetarian',
    spiceLevel: 'Medium',
    difficulty: 'Easy',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    totalTimeMinutes: 30,
    servings: 2,
    calories: 420,
    proteinGrams: 14,
    carbsGrams: 68,
    fatGrams: 9,
    isBeginnerFriendly: true,
    allergens: ['Dairy'],
    ingredients: [
      { name: 'Toor Dal', amount: '1 cup', category: 'Grains, Lentils & Oils' },
      { name: 'Basmati Rice', amount: '1 cup', category: 'Grains, Lentils & Oils' },
      { name: 'Ghee', amount: '1 tbsp', category: 'Dairy & Protein' },
    ],
    instructions: [{ step: 1, title: 'Boil dal', detail: 'Pressure cook lentils.' }],
    tips: 'Add ghee tadka right before serving.',
    rating: 4.9,
    reviewCount: 64,
    reviews: [],
    visualStyle: 'dal-rice',
  },
  {
    id: 'rajma-chawal',
    title: 'Punjabi Rajma Chawal',
    hindiName: 'राजमा चावल',
    description: 'Red kidney beans simmered in onion-tomato masala.',
    region: 'North Indian',
    mealCategories: ['Lunch'],
    diet: 'Vegan',
    spiceLevel: 'Medium',
    difficulty: 'Medium',
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    totalTimeMinutes: 45,
    servings: 3,
    calories: 460,
    proteinGrams: 16,
    carbsGrams: 74,
    fatGrams: 8,
    allergens: [],
    ingredients: [
      { name: 'Rajma (Kidney Beans)', amount: '1 cup', category: 'Grains, Lentils & Oils' },
      { name: 'Tomato', amount: '2 medium', category: 'Produce & Herbs' },
    ],
    instructions: [{ step: 1, title: 'Simmer rajma', detail: 'Cook until creamy.' }],
    tips: 'Mash a few beans to thicken gravy.',
    rating: 4.9,
    reviewCount: 52,
    reviews: [],
    visualStyle: 'rajma-rice',
  },
  {
    id: 'dhokla',
    title: 'Gujarati Khaman Dhokla',
    hindiName: 'खमण ढोकला',
    description: 'Steamed savoury gram flour sponge tempered with mustard seeds.',
    region: 'West Indian',
    mealCategories: ['Snacks', 'Breakfast'],
    diet: 'Vegan',
    spiceLevel: 'Mild',
    difficulty: 'Easy',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    servings: 4,
    calories: 190,
    proteinGrams: 7,
    carbsGrams: 28,
    fatGrams: 5,
    allergens: [],
    ingredients: [{ name: 'Besan (Gram Flour)', amount: '1.5 cups', category: 'Grains, Lentils & Oils' }],
    instructions: [{ step: 1, title: 'Steam batter', detail: 'Steam 15 mins.' }],
    tips: 'Pour warm tadka syrup over cut pieces.',
    rating: 4.8,
    reviewCount: 33,
    reviews: [],
    visualStyle: 'dhokla',
  },
  {
    id: 'butter-chicken',
    title: 'Old Delhi Murgh Makhani',
    hindiName: 'बटर चिकन',
    description: 'Charred chicken tikka simmered in velvety tomato-butter gravy.',
    region: 'North Indian',
    mealCategories: ['Dinner', 'Lunch'],
    diet: 'Non-vegetarian',
    spiceLevel: 'Medium',
    difficulty: 'Medium',
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    totalTimeMinutes: 45,
    servings: 4,
    calories: 540,
    proteinGrams: 34,
    carbsGrams: 14,
    fatGrams: 36,
    allergens: ['Dairy'],
    ingredients: [
      { name: 'Chicken Thighs', amount: '500 g', category: 'Dairy & Protein' },
      { name: 'Butter', amount: '3 tbsp', category: 'Dairy & Protein' },
    ],
    instructions: [{ step: 1, title: 'Roast chicken', detail: 'Sear marinated chicken.' }],
    tips: 'Finish with crushed kasuri methi.',
    rating: 4.9,
    reviewCount: 89,
    reviews: [],
    visualStyle: 'photo-rogan-josh',
  },
  {
    id: 'paneer-sandwich',
    title: 'Spiced Tawa Paneer Sandwich',
    hindiName: 'पनीर सैंडविच',
    description: 'Crisp toasted sandwich stuffed with spiced paneer and mint chutney.',
    region: 'North Indian',
    mealCategories: ['Dinner', 'Snacks'],
    diet: 'Vegetarian',
    spiceLevel: 'Medium',
    difficulty: 'Easy',
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    totalTimeMinutes: 20,
    servings: 2,
    calories: 340,
    proteinGrams: 16,
    carbsGrams: 34,
    fatGrams: 14,
    allergens: ['Dairy', 'Wheat'],
    ingredients: [
      { name: 'Paneer', amount: '150 g', category: 'Dairy & Protein' },
      { name: 'Whole Wheat Bread', amount: '4 slices', category: 'Grains, Lentils & Oils' },
    ],
    instructions: [{ step: 1, title: 'Toast on tawa', detail: 'Grill until golden.' }],
    tips: 'Spread green chutney generously.',
    rating: 4.7,
    reviewCount: 29,
    reviews: [],
    visualStyle: 'paneer-sandwich',
  },
];

const VEG_PREFS: UserPreferences = {
  favouriteCuisine: 'North Indian',
  foodPreference: 'Vegetarian',
  favouriteDishes: ['Paneer', 'Poha'],
  spicePreference: 'Medium',
  allergies: ['Peanuts'],
  cookingExperience: 'Beginner',
  preferredCookingTime: 'Under 30 minutes',
  mealStyle: 'Quick meals',
};

test('dietary compatibility strictly enforces Vegan, Vegetarian, and Eggetarian boundaries', () => {
  assert.equal(isDietCompatible('Non-vegetarian', 'Vegetarian'), false);
  assert.equal(isDietCompatible('Eggetarian', 'Vegetarian'), false);
  assert.equal(isDietCompatible('Vegan', 'Vegetarian'), true);
  assert.equal(isDietCompatible('Vegetarian', 'Vegan'), false);
  assert.equal(isDietCompatible('Eggetarian', 'Eggetarian'), true);
  assert.equal(isDietCompatible('Non-vegetarian', 'Eggetarian'), false);
});

test('daily recommendations remain deterministic for the same date and respect allergies & diet', () => {
  const firstCall = generateDailyRecommendations(SAMPLE_RECIPES, '2026-11-03', VEG_PREFS);
  const secondCall = generateDailyRecommendations(SAMPLE_RECIPES, '2026-11-03', VEG_PREFS);

  assert.deepEqual(firstCall, secondCall, 'Daily recommendation set must be stable across calls');
  // VEG_PREFS has 'Peanuts' allergy and 'Vegetarian' diet:
  // veg-poha has Peanuts, egg-bhurji is Eggetarian, butter-chicken is Non-vegetarian -> Breakfast must pick idli-sambar!
  assert.equal(firstCall.breakfastId, 'idli-sambar');
  assert.notEqual(firstCall.dinnerId, 'butter-chicken');
  assert.notEqual(firstCall.dinnerId, 'egg-bhurji');
});

test('alternative recipe selector swaps to a valid diet-safe option', () => {
  const noAllergyPrefs: UserPreferences = { ...VEG_PREFS, allergies: [] };
  const alt = getAlternativeRecipeForSlot(
    SAMPLE_RECIPES,
    'Breakfast',
    noAllergyPrefs,
    'veg-poha',
    []
  );
  assert.ok(alt);
  assert.notEqual(alt.id, 'veg-poha');
  assert.equal(isDietCompatible(alt.diet, 'Vegetarian'), true);
});

test('ingredient finder ranks recipes by pantry match percentage', () => {
  const matches = matchRecipesByIngredients(
    SAMPLE_RECIPES,
    ['Paneer', 'Whole Wheat Bread'],
    'Vegetarian'
  );
  assert.ok(matches.length > 0);
  assert.equal(matches[0].recipe.id, 'paneer-sandwich');
  assert.equal(matches[0].matchPercentage, 100);
});

test('serving scaler scales integer, decimal, and fractional quantities cleanly', () => {
  assert.equal(scaleIngredientAmount('2 cups', 2, 4), '4 cups');
  assert.equal(scaleIngredientAmount('1/2 tsp', 2, 4), '1 tsp');
  assert.equal(scaleIngredientAmount('150 g', 2, 3), '225 g');
});

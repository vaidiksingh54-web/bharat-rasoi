import React from 'react';
import { DishVisualStyle } from '../types';

const SPREAD_9_SRC = '/assets/aistudio/Screenshot_2026-11-03_232145_4e222cc4.png'; // 505x512
const ROYAL_THALI_SRC = '/assets/aistudio/Screenshot_2026-11-03_232207_98c642ea.png'; // 1366x768
const DAYLIGHT_THALI_SRC = '/assets/aistudio/Screenshot_2026-11-03_232346_a924b88d.png'; // 1366x768
const BIRYANI_SRC = '/assets/aistudio/Screenshot_2026-11-03_232409_3663a937.png'; // 1366x768

interface PhotoCropSpec {
  src: string;
  imgW: number;
  imgH: number;
  viewBox: string;
  tint: string;
}

const PHOTO_CROPS: Record<DishVisualStyle, PhotoCropSpec> = {
  'photo-butter-paneer': {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '14 12 158 158',
    tint: 'from-amber-950/20',
  },
  'photo-veg-pulao': {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '174 14 160 156',
    tint: 'from-stone-950/15',
  },
  'photo-rogan-josh': {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '336 14 158 156',
    tint: 'from-red-950/20',
  },
  'photo-palak-paneer': {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '14 176 160 158',
    tint: 'from-emerald-950/20',
  },
  'photo-paneer-tikka': {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '16 340 162 160',
    tint: 'from-orange-950/20',
  },
  'photo-dal-makhani': {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '175 344 160 158',
    tint: 'from-amber-950/20',
  },
  poha: {
    src: ROYAL_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '680 470 295 190',
    tint: 'from-amber-950/15',
  },
  'dal-rice': {
    src: DAYLIGHT_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '420 285 520 290',
    tint: 'from-stone-950/15',
  },
  dosa: {
    src: ROYAL_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '275 186 330 230',
    tint: 'from-amber-950/15',
  },
  idli: {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '295 298 196 196',
    tint: 'from-stone-950/15',
  },
  'paneer-sandwich': {
    src: ROYAL_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '300 205 310 215',
    tint: 'from-orange-950/20',
  },
  chilla: {
    src: DAYLIGHT_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '332 372 280 185',
    tint: 'from-amber-950/15',
  },
  dhokla: {
    src: DAYLIGHT_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '335 360 320 200',
    tint: 'from-amber-950/15',
  },
  samosa: {
    src: ROYAL_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '285 190 340 235',
    tint: 'from-amber-950/20',
  },
  'rajma-rice': {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '176 178 158 156',
    tint: 'from-red-950/20',
  },
  biryani: {
    src: BIRYANI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '532 200 335 155',
    tint: 'from-amber-950/15',
  },
  khichdi: {
    src: ROYAL_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '758 352 195 140',
    tint: 'from-amber-950/15',
  },
  'chole-bhature': {
    src: ROYAL_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '455 315 510 330',
    tint: 'from-amber-950/20',
  },
  'fish-curry': {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '336 174 158 158',
    tint: 'from-orange-950/20',
  },
  'thukpa-momo': {
    src: DAYLIGHT_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '435 235 340 220',
    tint: 'from-emerald-950/15',
  },
  'litti-chokha': {
    src: ROYAL_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '585 255 390 250',
    tint: 'from-amber-950/20',
  },
  'gulab-jamun': {
    src: ROYAL_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '960 334 150 124',
    tint: 'from-amber-950/20',
  },
  'egg-bhurji': {
    src: DAYLIGHT_THALI_SRC,
    imgW: 1366,
    imgH: 768,
    viewBox: '580 230 260 180',
    tint: 'from-amber-950/15',
  },
  'misal-pav': {
    src: SPREAD_9_SRC,
    imgW: 505,
    imgH: 512,
    viewBox: '176 176 158 158',
    tint: 'from-red-950/20',
  },
};

interface DishVisualProps {
  style: DishVisualStyle;
  title: string;
  className?: string;
}

export const DishVisual: React.FC<DishVisualProps> = ({
  style,
  title,
  className = '',
}) => {
  const crop = PHOTO_CROPS[style] || PHOTO_CROPS['photo-butter-paneer'];

  return (
    <div
      role="img"
      aria-label={title}
      className={`relative overflow-hidden bg-stone-800 select-none ${className}`}
    >
      <svg
        viewBox={crop.viewBox}
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <image
          href={crop.src}
          width={crop.imgW}
          height={crop.imgH}
          preserveAspectRatio="none"
        />
      </svg>
      <div
        className={`absolute inset-0 bg-gradient-to-t ${crop.tint} via-transparent to-transparent pointer-events-none`}
      />
    </div>
  );
};

export type Workout = {
  id: string;
  name: string;
  duration: number; // minutes
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  calories: number;
  category: string;
  about: string;
  equipment: string[];
  exercises: { name: string; reps: string; seconds: number }[];
};

export const workouts: Workout[] = [
  {
    id: 'full-body-burn',
    name: 'Full Body Burn',
    duration: 25,
    level: 'Intermediate',
    calories: 250,
    category: 'Full Body',
    about:
      'A full body workout designed to build strength, burn calories, and boost your energy.',
    equipment: ['Mat', 'Dumbbells', 'Water Bottle'],
    exercises: [
      { name: 'Squat', reps: '12 Reps', seconds: 30 },
      { name: 'Push Up', reps: '10 Reps', seconds: 30 },
      { name: 'Lunges', reps: '12 Reps', seconds: 30 },
      { name: 'Plank', reps: '30 Sec', seconds: 30 },
      { name: 'Burpees', reps: '8 Reps', seconds: 30 },
    ],
  },
  {
    id: 'fat-burn-hiit',
    name: 'Fat Burning HIIT',
    duration: 20,
    level: 'Advanced',
    calories: 300,
    category: 'HIIT',
    about: 'High-intensity intervals to maximize fat burn and cardio fitness.',
    equipment: ['Mat', 'Water Bottle'],
    exercises: [
      { name: 'High Knees', reps: '40 Sec', seconds: 40 },
      { name: 'Jump Squats', reps: '20 Reps', seconds: 40 },
      { name: 'Mountain Climbers', reps: '40 Sec', seconds: 40 },
      { name: 'Burpees', reps: '10 Reps', seconds: 40 },
    ],
  },
  {
    id: 'glute-toning',
    name: 'Glute Toning',
    duration: 15,
    level: 'Beginner',
    calories: 150,
    category: 'Lower Body',
    about: 'Tone and strengthen the glutes with targeted bodyweight movements.',
    equipment: ['Mat'],
    exercises: [
      { name: 'Glute Bridge', reps: '15 Reps', seconds: 30 },
      { name: 'Donkey Kicks', reps: '12 Reps', seconds: 30 },
      { name: 'Fire Hydrants', reps: '12 Reps', seconds: 30 },
      { name: 'Squats', reps: '15 Reps', seconds: 30 },
    ],
  },
  {
    id: 'core-crush',
    name: 'Core Crush',
    duration: 15,
    level: 'Intermediate',
    calories: 180,
    category: 'Abs & Core',
    about: 'Sculpt your core with this focused ab workout.',
    equipment: ['Mat'],
    exercises: [
      { name: 'Crunches', reps: '20 Reps', seconds: 30 },
      { name: 'Plank', reps: '40 Sec', seconds: 40 },
      { name: 'Russian Twists', reps: '20 Reps', seconds: 30 },
      { name: 'Leg Raises', reps: '15 Reps', seconds: 30 },
    ],
  },
  {
    id: 'morning-stretch',
    name: 'Morning Stretch',
    duration: 15,
    level: 'Intermediate',
    calories: 90,
    category: 'Stretching',
    about: 'Wake up your body and improve flexibility with a gentle stretch routine.',
    equipment: ['Mat'],
    exercises: [
      { name: 'Cat Cow', reps: '30 Sec', seconds: 30 },
      { name: 'Forward Fold', reps: '30 Sec', seconds: 30 },
      { name: 'Cobra', reps: '30 Sec', seconds: 30 },
    ],
  },
  {
    id: 'core-flow',
    name: 'Core Flow',
    duration: 15,
    level: 'Intermediate',
    calories: 140,
    category: 'Yoga',
    about: 'A flowing yoga sequence centered on the core.',
    equipment: ['Mat'],
    exercises: [
      { name: 'Boat Pose', reps: '30 Sec', seconds: 30 },
      { name: 'Plank to Down Dog', reps: '40 Sec', seconds: 40 },
      { name: 'Side Plank', reps: '30 Sec', seconds: 30 },
    ],
  },
];

export const categories = [
  { id: 'full-body', label: 'Full Body' },
  { id: 'upper-body', label: 'Upper Body' },
  { id: 'lower-body', label: 'Lower Body' },
  { id: 'abs-core', label: 'Abs & Core' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'hiit', label: 'HIIT' },
];

export const filters = ['All', 'Strength', 'Cardio', 'Yoga', 'Stretching'];

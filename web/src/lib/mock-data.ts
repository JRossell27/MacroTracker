export type MacroSet = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealLog = {
  name: string;
  time: string;
  macros: MacroSet;
  items: {
    name: string;
    serving: string;
    macros: Partial<MacroSet>;
  }[];
};

export type DailyLog = {
  date: string;
  goal: MacroSet;
  intake: MacroSet;
  activeCalories: number;
  basalCalories: number;
  hydrationOz: number;
  hydrationTargetOz: number;
  weight: number;
  notes: string[];
  meals: MealLog[];
};

export type WeeklyTrend = {
  startDate: string;
  endDate: string;
  averageNetCalories: number;
  averageWeightChange: number;
  streak: number;
  compliance: number;
  energySeries: {
    date: string;
    netCalories: number;
  }[];
  macroBreakdown: {
    protein: number;
    carbs: number;
    fat: number;
  };
};

export const dailyLog: DailyLog = {
  date: "2024-10-07",
  goal: {
    calories: 2200,
    protein: 165,
    carbs: 210,
    fat: 70,
  },
  intake: {
    calories: 1985,
    protein: 154,
    carbs: 185,
    fat: 66,
  },
  activeCalories: 735,
  basalCalories: 1820,
  hydrationOz: 94,
  hydrationTargetOz: 110,
  weight: 184.2,
  notes: [
    "Strength training: lower body + core",
    "Energy felt high throughout the day",
  ],
  meals: [
    {
      name: "Breakfast",
      time: "07:45 AM",
      macros: {
        calories: 420,
        protein: 32,
        carbs: 38,
        fat: 15,
      },
      items: [
        {
          name: "Spinach egg white omelette",
          serving: "1 serving",
          macros: { protein: 24, calories: 250 },
        },
        {
          name: "Blueberries",
          serving: "0.75 cup",
          macros: { carbs: 18, calories: 120 },
        },
      ],
    },
    {
      name: "Lunch",
      time: "12:15 PM",
      macros: {
        calories: 560,
        protein: 42,
        carbs: 52,
        fat: 18,
      },
      items: [
        {
          name: "Grilled salmon bowl",
          serving: "1 bowl",
          macros: { calories: 480, protein: 38 },
        },
        {
          name: "Sparkling water",
          serving: "12 oz",
          macros: {},
        },
      ],
    },
    {
      name: "Snack",
      time: "03:30 PM",
      macros: {
        calories: 210,
        protein: 18,
        carbs: 18,
        fat: 8,
      },
      items: [
        {
          name: "Greek yogurt",
          serving: "1 cup",
          macros: { protein: 17, carbs: 12, calories: 180 },
        },
        {
          name: "Almonds",
          serving: "12 pieces",
          macros: { fat: 7, calories: 100 },
        },
      ],
    },
    {
      name: "Dinner",
      time: "07:00 PM",
      macros: {
        calories: 650,
        protein: 52,
        carbs: 60,
        fat: 25,
      },
      items: [
        {
          name: "Roasted chicken thighs",
          serving: "6 oz",
          macros: { protein: 36, fat: 18, calories: 390 },
        },
        {
          name: "Quinoa",
          serving: "1 cup",
          macros: { carbs: 39, calories: 222 },
        },
        {
          name: "Steamed broccoli",
          serving: "1 cup",
          macros: { carbs: 8, calories: 44 },
        },
      ],
    },
    {
      name: "Protein shake",
      time: "09:15 PM",
      macros: {
        calories: 145,
        protein: 20,
        carbs: 17,
        fat: 4,
      },
      items: [
        {
          name: "Whey isolate shake",
          serving: "1 scoop with almond milk",
          macros: { protein: 20, carbs: 9, calories: 145 },
        },
      ],
    },
  ],
};

export const weeklyTrend: WeeklyTrend = {
  startDate: "2024-10-01",
  endDate: "2024-10-07",
  averageNetCalories: -485,
  averageWeightChange: -0.97,
  streak: 18,
  compliance: 86,
  energySeries: [
    { date: "Tue", netCalories: -320 },
    { date: "Wed", netCalories: -450 },
    { date: "Thu", netCalories: -510 },
    { date: "Fri", netCalories: -610 },
    { date: "Sat", netCalories: -380 },
    { date: "Sun", netCalories: -530 },
    { date: "Mon", netCalories: -495 },
  ],
  macroBreakdown: {
    protein: 32,
    carbs: 40,
    fat: 28,
  },
};

export function getNetCalories(log: DailyLog) {
  return log.intake.calories - log.activeCalories - log.basalCalories;
}

export function getEstimatedWeightChange(netCalories: number) {
  const pounds = netCalories / 3500;
  return Number(pounds.toFixed(2));
}

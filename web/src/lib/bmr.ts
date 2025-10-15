export type BiologicalSex = "male" | "female";

type CalculateBmrArgs = {
  weightLbs: number;
  heightInches: number;
  age: number;
  sex: BiologicalSex;
};

export function calculateBmr({
  weightLbs,
  heightInches,
  age,
  sex,
}: CalculateBmrArgs): number {
  const weightKg = weightLbs * 0.45359237;
  const heightCm = heightInches * 2.54;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const adjustment = sex === "male" ? 5 : -161;
  return base + adjustment;
}

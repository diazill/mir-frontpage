// Category name -> illustration in public/images/animals (Microsoft Fluent
// Emoji, MIT). Matching is by keyword so "Pakan Kucing" also finds the cat.
const ANIMAL_ILLUSTRATIONS: [keywords: string[], src: string][] = [
  [["kucing"], "/images/animals/cat.svg"],
  [["burung"], "/images/animals/bird.svg"],
  [["unggas", "ayam", "bebek"], "/images/animals/rooster.svg"],
  [["sapi", "ternak"], "/images/animals/cow.svg"],
  [["kambing", "domba"], "/images/animals/goat.svg"],
  [["kelinci"], "/images/animals/rabbit.svg"],
  [["ikan"], "/images/animals/fish.svg"],
];

export function animalIllustration(category: string): string | null {
  const name = category.toLocaleLowerCase("id-ID");
  return ANIMAL_ILLUSTRATIONS.find(([keywords]) => keywords.some((k) => name.includes(k)))?.[1] ?? null;
}

// Subset of adjectives and animals from the original Rust implementation
const ADJECTIVES = [
  'Brave',
  'Calm',
  'Clever',
  'Curious',
  'Daring',
  'Eager',
  'Fancy',
  'Gentle',
  'Happy',
  'Jolly',
  'Kind',
  'Lucky',
  'Merry',
  'Noble',
  'Proud',
  'Quick',
  'Quiet',
  'Silly',
  'Swift',
  'Wise',
  'Witty',
  'Zany',
  'Zealous',
  'Bright',
  'Cozy',
  'Fluffy',
  'Fuzzy',
  'Gleaming',
  'Graceful',
  'Humble',
  'Jazzy',
  'Lively',
  'Peaceful',
  'Rustic',
  'Snappy',
  'Sparkly',
  'Spunky',
  'Sturdy',
  'Sunny',
  'Tender',
  'Vivid',
  'Wandering',
  'Whimsical',
  'Wild',
  'Wonderful',
  'Adorable',
  'Cheerful',
  'Dreamy',
  'Enchanted',
  'Festive'
];

const ANIMALS = [
  'Alpaca',
  'Badger',
  'Bear',
  'Beaver',
  'Bunny',
  'Cat',
  'Corgi',
  'Deer',
  'Dog',
  'Dolphin',
  'Duck',
  'Eagle',
  'Elephant',
  'Falcon',
  'Fox',
  'Frog',
  'Giraffe',
  'Goat',
  'Hamster',
  'Hedgehog',
  'Hippo',
  'Koala',
  'Lemur',
  'Lion',
  'Llama',
  'Moose',
  'Otter',
  'Owl',
  'Panda',
  'Penguin',
  'Rabbit',
  'Raccoon',
  'Seal',
  'Sloth',
  'Squirrel',
  'Tiger',
  'Turtle',
  'Walrus',
  'Wolf',
  'Zebra'
];

export function generateListName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adjective} ${animal}`;
}

export function listNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function slugToListName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

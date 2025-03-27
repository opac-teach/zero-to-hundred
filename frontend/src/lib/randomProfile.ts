// Username patterns
const usernamePatterns = [
  "Crypto{animal}{number}",
  "Moon{object}{number}",
  "HODL{action}{number}",
  "Degen{adjective}{number}",
  "Chad{status}{number}",
];

const animals = ["Doge", "Pepe", "Wojak", "Chad", "Giga", "Ape", "Whale"];
const objects = ["Lambo", "Rocket", "Diamond", "Moon", "Mars", "Saturn"];
const actions = ["Trader", "Holder", "Flipper", "Stacker", "Farmer"];
const adjectives = ["Chad", "Giga", "Mega", "Ultra", "Super"];
const status = ["King", "Lord", "Master", "Boss", "Legend"];

export function generateRandomUsername(): string {
  const pattern = usernamePatterns[Math.floor(Math.random() * usernamePatterns.length)];
  const number = Math.floor(Math.random() * 1000);

  let username = pattern;

  if (pattern.includes("{animal}")) {
    username = username.replace("{animal}", animals[Math.floor(Math.random() * animals.length)]);
  }
  if (pattern.includes("{object}")) {
    username = username.replace("{object}", objects[Math.floor(Math.random() * objects.length)]);
  }
  if (pattern.includes("{action}")) {
    username = username.replace("{action}", actions[Math.floor(Math.random() * actions.length)]);
  }
  if (pattern.includes("{adjective}")) {
    username = username.replace(
      "{adjective}",
      adjectives[Math.floor(Math.random() * adjectives.length)]
    );
  }
  if (pattern.includes("{status}")) {
    username = username.replace("{status}", status[Math.floor(Math.random() * status.length)]);
  }

  username = username.replace("{number}", number.toString());

  return username;
}

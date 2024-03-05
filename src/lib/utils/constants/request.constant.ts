const bestPractice = `When naming your requests, remember that resources are at the core
of REST. Use nouns to represent your resources, such as 'user
accounts' or 'managed devices.' Keep your URIs clear and
consistent by using forward slashes to indicate hierarchy, avoid
file extensions.`;

const dos = [
  "Use nouns to represent resources",
  "Use forward slashes for hierarchy",
  "Use hyphens for readability",
  "Use lowercase letters in URIs",
  "Use HTTP methods for CRUD actions",
];
const donts = [
  "Don't use file extensions.",
  "Don't use underscores in URIs.",
  "Don't use verbs in the URIs.",
  "Don't put CRUD function names in URIs.",
  "Don't use capital letters in URIs.",
];
export const CollectionMessage = ["Add Folder", "Add Request"];
export { bestPractice, dos, donts };

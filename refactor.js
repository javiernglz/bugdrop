const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  for (const [search, replace] of replacements) {
    newContent = newContent.replace(search, replace);
  }
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        walkDir(fullPath, callback);
      }
    } else {
      callback(fullPath);
    }
  }
}

const massReplacements = [
  // DB schema & generic naming
  [/villains/g, 'users'],
  [/villain_id/g, 'user_id'],
  [/req\.villain/g, 'req.user'],
  [/villain_session/g, 'session'],
  [/villain/g, 'user'],
  [/Villain/g, 'User'],
  // CTF flags & specific constants
  [/dr_maligno/g, 'bugdrop_admin'],
  [/Dr\. Maligno/g, 'The Creator'],
  [/villain_supply\.db/g, 'bugdrop.db'],
  // auth context updates
  [/(const|let|var)\s+user\s*=\s*useAuth/g, 'const { user } = useAuth'],
  [/setVillain/g, 'setUser'],
];

console.log("--- Starting backend refactor ---");
walkDir('./backend/src', (filePath) => {
  if (!filePath.endsWith('.js')) return;
  // Skip seed.js and init.js, I will rewrite them manually for clean logic
  if (filePath.includes('seed.js') || filePath.includes('init.js')) return;
  replaceInFile(filePath, massReplacements);
});

console.log("--- Starting frontend refactor ---");
walkDir('./frontend-shop/src', (filePath) => {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  replaceInFile(filePath, massReplacements);
});

walkDir('./frontend-soc/src', (filePath) => {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  replaceInFile(filePath, massReplacements);
});

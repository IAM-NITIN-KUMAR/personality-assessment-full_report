const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '../public/fonts');
if (!fs.existsSync(fontsDir)) fs.mkdirSync(fontsDir, { recursive: true });

const FONTS = [
  {
    name: 'Outfit-Regular.ttf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/outfit@latest/400Regular/Outfit_400Regular.ttf'
  },
  {
    name: 'Outfit-Bold.ttf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/outfit@latest/700Bold/Outfit_700Bold.ttf'
  },
  {
    name: 'Outfit-ExtraBold.ttf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/outfit@latest/800ExtraBold/Outfit_800ExtraBold.ttf'
  },
  {
    name: 'PlusJakartaSans-Regular.ttf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/plus-jakarta-sans@latest/400Regular/PlusJakartaSans_400Regular.ttf'
  },
  {
    name: 'PlusJakartaSans-Bold.ttf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/plus-jakarta-sans@latest/700Bold/PlusJakartaSans_700Bold.ttf'
  },
  {
    name: 'PlusJakartaSans-Italic.ttf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/plus-jakarta-sans@latest/400Regular_Italic/PlusJakartaSans_400Regular_Italic.ttf'
  },
  {
    name: 'JetBrainsMono-Regular.ttf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/jetbrains-mono@latest/400Regular/JetBrainsMono_400Regular.ttf'
  },
  {
    name: 'JetBrainsMono-Bold.ttf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/jetbrains-mono@latest/700Bold/JetBrainsMono_700Bold.ttf'
  }
];

async function downloadFont(name, url) {
  const dest = path.join(fontsDir, name);
  console.log(`Downloading ${name} from ${url}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    console.log(`Successfully downloaded ${name}`);
  } catch (error) {
    console.error(`Failed to download ${name}:`, error.message);
  }
}

async function main() {
  for (const font of FONTS) {
    await downloadFont(font.name, font.url);
  }
  console.log('Fonts download process completed.');
}

main();


import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputDir = join(__dirname, '..', 'src', 'assets');
const outputFile = join(outputDir, 'avatar-config.json');

mkdirSync(outputDir, { recursive: true });

const pad = (value) => value.toString().padStart(3, '0');

const avatars = Array.from({ length: 108 }, (_, index) => {
  const id = index + 1;
  return {
    id: `avatar-${pad(id)}`,
    name: `Avatar ${pad(id)}`,
    rarity: id % 9 === 0 ? 'legendary' : id % 3 === 0 ? 'rare' : 'common',
    image: `/avatars/avatar-${pad(id)}.png`,
  };
});

writeFileSync(outputFile, JSON.stringify({ generatedAt: new Date().toISOString(), avatars }));
console.log(`Avatar config generated: ${outputFile}`);

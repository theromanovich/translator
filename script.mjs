import fs from 'fs/promises';
import path from 'path';
import * as deepl from 'deepl-node';

const __dirname = new URL('.', import.meta.url).pathname;

const authKey = "a61df894-f751-d9de-ae0c-bd7a7a8f4b89:fx";
const translator = new deepl.Translator(authKey);

const inputFolderPath = path.join(__dirname, 'pages');
const outputFolderPath = path.join(__dirname, 'translated_pages');

async function translateFile(inputFilePath, targetLanguage, outputFolderPath) {
  try {
    const content = await fs.readFile(inputFilePath, 'utf-8');

    const frontMatterRegex = /^---([\s\S]*?)---/;
    const frontMatterMatch = content.match(frontMatterRegex);
    const frontMatter = frontMatterMatch ? frontMatterMatch[0] : '';

    const contentToTranslate = content.replace(frontMatter, '');

    const staticFrontMatterKeys = ['layout', 'permalink', 'ru_permalink'];

    const frontMatterLines = frontMatter.split('\n');
    const translatedFrontMatter = await Promise.all(frontMatterLines.map(async (line) => {
      if (line.trim() === '' || line.includes(':')) {
        const key = line.split(':')[0].trim();
        const value = line.slice(line.indexOf(':') + 1).trim();
        if (value !== '') {
          if (staticFrontMatterKeys.includes(key)) return `${key}: ${value}`
          const translation = await translator.translateText(value, null, targetLanguage);
          return `${key}: ${translation.text}`;
        } else {
          return line;
        }
      } else {
        return line;
      }
    }));

    const response = await translator.translateText(contentToTranslate, null, targetLanguage);

    const translatedContent = translatedFrontMatter.join('\n') + response.text;
    
    // Определяем относительный путь и создаем соответствующую папку в outputFolderPath
    const relativePath = path.relative(inputFolderPath, inputFilePath);
    const outputFilePath = path.join(outputFolderPath, relativePath);

    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.writeFile(outputFilePath, translatedContent, 'utf-8');

  } catch (error) {
    console.error(`Error translating ${inputFilePath}: ${error.message}`);
  }
}

async function translateFilesRecursively(inputFolderPath, outputFolderPath, targetLanguage) {
  try {
    const items = await fs.readdir(inputFolderPath);

    for (const item of items) {
      const inputItemPath = path.join(inputFolderPath, item);

      const stats = await fs.stat(inputItemPath);

      if (stats.isDirectory()) {
        await translateFilesRecursively(inputItemPath, outputFolderPath, targetLanguage);
      } else if (stats.isFile() && item.endsWith('.md')) {
        await translateFile(inputItemPath, targetLanguage, outputFolderPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${inputFolderPath}: ${error.message}`);
  }
}

try {
  const targetLanguage = process.argv[2] || 'RU';
  await translateFilesRecursively(inputFolderPath, outputFolderPath, targetLanguage);
} catch (error) {
  console.error(`Error translating files: ${error.message}`);
}

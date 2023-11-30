import fs from 'fs';
import path from 'path';
import * as deepl from 'deepl-node';

const __dirname = new URL('.', import.meta.url).pathname;

const authKey = "a61df894-f751-d9de-ae0c-bd7a7a8f4b89:fx";
const translator = new deepl.Translator(authKey);

const inputFolderPath = path.join(__dirname, 'pages');
const outputFolderPath = path.join(__dirname, 'translated_pages');

if (!fs.existsSync(outputFolderPath)) {
  fs.mkdirSync(outputFolderPath);
}

async function translateFile(filePath, targetLanguage) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Находим блоки `--- ---` и сохраняем их без изменений
  const frontMatterRegex = /^---([\s\S]*?)---/;
  const frontMatterMatch = content.match(frontMatterRegex);
  const frontMatter = frontMatterMatch ? frontMatterMatch[0] : '';

  // Исключаем блок `--- ---` из контента для перевода
  const contentToTranslate = content.replace(frontMatter, '');

  try {
    // Переводим только значения ключей в блоке `--- ---`
    const translatedFrontMatter = await Promise.all(frontMatter.match(/:([\s\S]*?)(?=(\w+:)|$)/g).map(async (match) => {
      const translation = await translator.translateText(match.slice(1).trim(), null, targetLanguage);
      return `: ${translation.text}`;
    }));

    // Переводим только контент без блока `--- ---`
    const response = await translator.translateText(contentToTranslate, null, targetLanguage);
    console.log(response.text);

    // Восстанавливаем оригинальные ключи и переведенный контент
    const translatedContent = translatedFrontMatter.join('') + response.text;
    const outputFilePath = path.join(outputFolderPath, path.basename(filePath));
    fs.writeFileSync(outputFilePath, translatedContent, 'utf-8');

  } catch (error) {
    console.error(`Error translating ${filePath}: ${error.message}`);
  }
}

// Получаем язык из аргументов командной строки или используем значение по умолчанию ('RU')
const targetLanguage = process.argv[2] || 'RU';

fs.readdirSync(inputFolderPath)
  .filter((file) => file.endsWith('.md'))
  .forEach((file) => {
    const filePath = path.join(inputFolderPath, file);
    translateFile(filePath, targetLanguage);
});

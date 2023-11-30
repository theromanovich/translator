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

  const frontMatterRegex = /^---([\s\S]*?)---/;
  const contentWithoutFrontMatter = content.replace(frontMatterRegex, '');

  try {
    const response = await translator.translateText(contentWithoutFrontMatter, null, targetLanguage);
    console.log(response.text);

    const translatedContent = content.replace(contentWithoutFrontMatter, response.text);
    const outputFilePath = path.join(outputFolderPath, path.basename(filePath));
    fs.writeFileSync(outputFilePath, translatedContent, 'utf-8');

  } catch (error) {
    console.error(`Error translating ${filePath}: ${error.message}`);
  }
}

const targetLanguage = process.argv[2] || 'RU';

fs.readdirSync(inputFolderPath)
  .filter((file) => file.endsWith('.md'))
  .forEach((file) => {
    const filePath = path.join(inputFolderPath, file);
    translateFile(filePath, targetLanguage);
});
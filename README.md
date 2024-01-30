# md Translator

## How it works

- Install dependencies

```bash
npm i
```

- Add pages with the extension `.md` to the `pages` folder

- Run the command (by default, it will be translated into Ukrainian)

```bash
npm run translate
```

You can also specify the language for translation (it will be translated into Russian)

```
npm run translate RU
```

[List of supported languages](https://developers.deepl.com/docs/resources/supported-languages#target-languages)

- Translated pages will be generated in the `translated_pages` folder
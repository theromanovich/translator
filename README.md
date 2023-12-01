# Перекладач .md сторінок

## Як це працює

- встановлення залежностей 

```bash
npm i
```

- в папку `pages` додаємо сторінки з розширенням `.md`

- запускаємо команду (по дефолту буде перекладено на російську мову)

```bash
npm run translate
```

Також можна передавати мову на яку треба перекласти (буде перекладено на українську)

```
npm run translate UK
```

[список підтримуємих мов](https://developers.deepl.com/docs/resources/supported-languages#target-languages)

- перекладені сторінки будуть згенеровані в папці `translated_pages`

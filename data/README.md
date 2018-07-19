# Data

## New Crawler

- [뉴스 기사 크롤러](./news_crawler.py)

### Requirements

- Python 2.7
  - bs4
  - requests

### Example

Crawl 조선일보 articles:

```bash
python news_crawler.py --type 조선일보 --start-id 0003369060
```

## Prebuilt Data for Node.js

- [models.7z](./models.7z)

Unzip `models.7z` as CSV file.

You can use the prebuilt model with [Kokoa.load(file)](https://astro36.github.io/Kokoa/api/Kokoa.html#.load) function:

```javascript
const Kokoa = require('kokoanlp');
const kokoa = Kokoa.load('./data/kokoa.all.csv');
```

## Prebuilt Data for Web

- [kokoa.all.csv](./kokoa.all.csv)

See [Demo](../demo/scripts/load.js)

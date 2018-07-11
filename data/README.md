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

- [kokoa-data.7z](./kokoa-data.7z)

Unzip `kokoa-data.7z` as CSV file.

You can use the prebuilt model with [Kokoa.load(file)](https://astro36.github.io/Kokoa/api/Kokoa.html#.load) function:

```javascript
const Kokoa = require('kokoanlp');
const kokoa = Kokoa.load('./data/kokoa.*.csv');
```

## Prebuilt Data for Web

- [kokoa-data.csv](./kokoa-data.csv)

See [Demo](../demo/scripts/load.js)

# Stock Fetcher API 📈📊📉

The **Stock Fetcher API** is a simple and efficient API for accessing historical stock data. It currently supports top 100 stocks from **NYSE** and **NASDAQ** markets, with more datasets to be added in the future.

This project started as a requirement for accessing stock datasets for coursework in my MSc program in **Management Information Systems**, focusing on **AI and Computational Management Information Systems**. The goal is to provide easy and efficient access to curated stock datasets, and eventually build a Python library inspired by [Yahoo Historical](https://github.com/AndrewRPorter/yahoo-historical) library.

---

## Features
- **Historical Stock Data**:
  - Top 100 NYSE daily stock prices.
  - Top 100 NASDAQ daily stock prices.
- **Fast and Efficient**:
  - Cached responses for repeated requests.
  - Lightweight in-memory cache implementation.
- **Flexible Query Parameters**:
  - Specify market, stock symbol, start date, and end date for precise data retrieval.
- **Expandable**:
  - More datasets will be added over time.

---

## Data Sources

The stock data is sourced from **Kaggle Datasets**:

1. **Top 100 NYSE Daily Stock Prices**  
   Dataset: [https://www.kaggle.com/datasets/svaningelgem/nyse-100-daily-stock-prices](https://www.kaggle.com/datasets/svaningelgem/nyse-100-daily-stock-prices)  
   Owner: [Steven Van Ingelgem](https://www.kaggle.com/svaningelgem)

2. **Top 100 NASDAQ Daily Stock Prices**  
   Dataset: [https://www.kaggle.com/datasets/svaningelgem/nasdaq-100-daily-stock-prices](https://www.kaggle.com/datasets/svaningelgem/nasdaq-100-daily-stock-prices)  
   Owner: [Steven Van Ingelgem](https://www.kaggle.com/svaningelgem)

### Credits
- Data is sourced from **Kaggle Datasets** and credited to the respective owners.
- Special thanks to **Steven Van Ingelgem** for providing the datasets.

---

## API Documentation

### Base URL
http://localhost:3000/api/v1


### Endpoints

#### **1. Get Historical Stock Data**
Retrieve historical stock data for a specific market and stock symbol.

**URL**:  
`GET /stocks/:market/:symbol`

**Parameters**:
| Parameter | Type     | Description                                       |
|-----------|----------|---------------------------------------------------|
| `:market` | String   | Exchange market name (nyse, nasdaq, etc).         |
| `:symbol` | String   | Stock symbol (AAPL, GOOGL, TSLA, etc).            |
| `start`   | Integer  | Start date in YYYY-MM-DD format (required).          |
| `end`     | Integer  | End date in YYYY-MM-DD format (optional, defaults to `Infinity`). |

**Request Example**:
```bash
curl "http://localhost:3000/api/v1/stocks/nasdaq/AAPL?start=1609459200&end=1612137600"

{
  "timestamp": [1609459200, 1609545600],
  "indicators": {
    "quote": [
      {
        "open": [134.5, 135.8],
        "high": [136.0, 138.0],
        "low": [132.0, 133.2],
        "close": [135.5, 136.8]
      }
    ]
  },
  "meta": {
    "currency": "USD",
    "symbol": "AAPL",
    "fullExchangeName": "NASDAQ"
  }
}
```

---

## Future Plans
1. **Automated Dataset Updates**:
    - A **GitHub Actions cron job** will periodically fetch updated datasets from [Kaggle](https://www.kaggle.com/docs/api) to ensure the data is current.
    - Top 100 NASDAQ daily stock prices.
2. **Python Library**:
    - A Python library to provide seamless access to stock data from this API.
    - Inspired by [Yahoo Historical](https://github.com/AndrewRPorter/yahoo-historical).
3. **Additional Datasets**:
    - Support for more markets and datasets.

---

## Contributions
Contributions are welcome 🤗! If you’d like to add features, fix bugs, or improve the API, feel free to open a pull request.
> Pro Tip: If you’re stuck debugging for hours, take a break. Trust me, I spent 5+ hours trying to deploy this to [Fly.io](https://fly.io/), only to realize I just needed to update the CLI. Rest is underrated. 😅
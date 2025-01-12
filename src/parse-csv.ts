import stockStructure from './stock-structure.json';

/**
 * Parse CSV data and convert it into the required JSON structure
 * @param {string} data - Raw CSV data as a string
 * @param {string} symbol - Stock symbol for metadata
 * @param {string} market - Stock Exchange Name for metadata
 * @param {number} start - Start timestamp for filtering data
 * @param {number} [end] - End timestamp for filtering data (optional)
 * @returns {object} - JSON structure with chart data
 */
const toJson = (
  data: string,
  symbol: string,
  market: string,
  start: number,
  end = Infinity,
): object => {
  const rows = data.split('\n');
  const headers = rows[0].split(',');
  const allRows = rows.slice(1).filter((row) => row.trim() !== '');

  // Initialize JSON structure
  let result = JSON.parse(JSON.stringify(stockStructure));

  for (const row of allRows) {
    const values = row.split(',');
    const rowData = headers.reduce((acc, header, index) => {
      acc[header.trim()] = values[index].trim();
      return acc;
    }, {} as Record<string, string>);

    const rowTimestamp = Math.floor(new Date(rowData.date).getTime() / 1000);

    // Filter rows by start and end timestamps
    if (rowTimestamp >= start && rowTimestamp <= end) {
      result.timestamp.push(rowTimestamp);
      result.indicators.quote[0].low.push(parseFloat(rowData.low));
      result.indicators.quote[0].high.push(parseFloat(rowData.high));
      result.indicators.quote[0].close.push(parseFloat(rowData.close));
      result.indicators.quote[0].open.push(parseFloat(rowData.open));
    }
  }

  result = {
    ...result,
    meta: {
      currency: 'USD',
      symbol: symbol,
      fullExchangeName: market,
    },
  };

  return result;
};

export { toJson };

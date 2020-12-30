import {cantons} from './cantons.js';

// EXTREMELY basic (but fast) CSS parser for number and dates ONLY.
// Do not use with just any data, it will explode spectacularely.
function parseCSV(text, sep = ',') {
  const lines = text.split('\n');
  const rows = [];

  for (let i = 0; i < lines.length; i++) {
    // Skip empty lines
    if (lines[i].trim() === '') {
      continue;
    }

    rows.push([]);

    const values = lines[i].split(sep);
    for (let j = 0; j < values.length; j++) {
      const value = values[j];

      // TODO: Fix the following mess
      if (value === null || value === '') {
        // No value -> null
        rows[i].push(null);
      } else if (value.match(/\d{4}-\d{2}-\d{2}/)) {
        // Basic date match
        rows[i].push(Date.parse(value));
      } else if (
        value.match(/^(\d|-\d)/) &&
                !value.includes(' ') &&
                !value.endsWith('+')
      ) {
        // Number
        rows[i].push(parseFloat(value));
      } else {
        // Text
        rows[i].push(value);
      }
    }
  }

  return rows;
}

async function readCSV(url, index = [0], sep = ',') {
  const response = await fetch(url);
  const text = await response.text();
  const csv = parseCSV(text, sep);

  const obj = {};
  for (let i = 0; i < csv[0].length; i++) {
    if (i === index) continue;

    obj[csv[0][i]] = [];
    for (let j = 1; j < csv.length; j++) {
      obj[csv[0][i]].push([csv[j][index], csv[j][i]]);
    }
  }

  return obj;
}

function getChart(container) {
  return Highcharts.charts[
      document.getElementById(container).getAttribute('data-highcharts-chart')
  ];
}

function getTargetCoutryDate(daysAgo = 0, formatted = false, format = 'DD. MM.') {
  if (!formatted) {
    return Date.parse(
        moment(new Date())
            .subtract(daysAgo, 'day')
            .tz('Europe/Zurich')
            .format('YYYY-MM-DD'),
    );
  } else {
    return moment(new Date())
      .subtract(daysAgo, 'day')
      .tz('Europe/Zurich')
      .format(format)
  }
}

function getRow(data, rowId) {
  const row = {};
  for (const [key, value] of Object.entries(data)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i][0] === rowId) {
        row[key] = value[i][1];
      }
    }
  }
  return row;
}

function getField(data, rowId, columnName) {
  let field = Number.NaN;
  const column = data[columnName];
  for (let i = 0; i < column.length; i++) {
    if (column[i][0] === rowId) {
      field = column[i][1];
    }
  }
  return field;
}

function forwardFill(column) {
  const newColumn = column.slice();

  for (let i = 1; i < newColumn.length; i++) {
    if (newColumn[i][1] === null) {
      newColumn[i][1] = newColumn[i - 1][1];
    }
  }

  return newColumn;
}

function backwardsResample(column, windowSize = 7, samplingInterval = 7, countIndex=true, n = null) {
  let k = 0;
  const newColumn = [];

  for (let i = column.length - 1; i >= windowSize; i -= samplingInterval) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += column[i - j][1];
    }
    if (countIndex) {
      newColumn.push([k++, sum / windowSize]);
    } else {
      newColumn.push([column[i][0], sum / windowSize]);
    }
    if (newColumn.length === n) {
      break;
    }
  }

  return newColumn.reverse();
}

function multiplyColumn(column, scalar) {
  const newColumn = column.slice();

  for (let i = 0; i < newColumn.length; i++) {
    if (newColumn[i][1] !== null) {
      newColumn[i][1] = newColumn[i][1] * scalar;
    }
  }

  return newColumn;
}

function roundColumn(column, decimals=3) {
  const newColumn = column.slice();
  const exp = 10**decimals;

  for (let i = 0; i < newColumn.length; i++) {
    if (newColumn[i][1] !== null) {
      newColumn[i][1] = Math.round(exp * newColumn[i][1]) / exp;
    }
  }

  return newColumn;
}

function getUnique(column) {
  return [...new Set(column.map((item) => item[1]))];
}

function where(df, filters) {
  const newDf = {};

  for (const [col] of Object.entries(df)) {
    newDf[col] = [];
  }

  for (let i = 0; i < df[filters[0][0]].length; i++) {
    let skip = false;
    for (const filter of filters) {
      if (!filter[1](df[filter[0]][i][1])) {
        skip = true;
      }
    }

    if (skip) continue;

    for (const [col] of Object.entries(df)) {
      newDf[col].push(df[col][i]);
    }
  }

  return newDf;
}

function setIndex(df, columnName) {
  for (const [col] of Object.entries(df)) {
    for (let i = 0; i < df[col].length; i++) {
      df[col][i][0] = df[columnName][i][1];
    }
  }

  return df;
}

function groupBy(df, columnNames, agg) {
  return groupBy_(df, columnNames, agg);
}

function groupBy_(df, columnNames, agg) {
  const newDf = {};
  const columnName = columnNames.shift();
  const uniqueValues = getUnique(df[columnName]);

  for (const uniqueValue of uniqueValues) {
    newDf[uniqueValue] = {};

    for (const col in df) {
      if (col === columnName) continue;
      newDf[uniqueValue][col] = [];
    }
  }

  for (let i = 0; i < df[columnName].length; i++) {
    const value = df[columnName][i][1];
    for (const col in df) {
      if (col === columnName) continue;
      newDf[value][col].push(df[col][i]);
    }
  }

  if (columnNames.length > 0) {
    for (const uniqueValue of uniqueValues) {
      newDf[uniqueValue] = groupBy_(
          newDf[uniqueValue],
          columnNames.slice(),
          agg,
      );
    }
  } else {
    // Aggregate
    if (agg === 'sum') {
      for (const uniqueValue of uniqueValues) {
        for (const [col] of Object.entries(newDf[uniqueValue])) {
          let sum = 0;
          for (let i = 0; i < newDf[uniqueValue][col].length; i++) {
            sum += newDf[uniqueValue][col][i][1];
          }
          newDf[uniqueValue][col] = sum;
        }
      }
    }
  }

  return newDf;
}

function getUserLanguage() {
  let lang = window.navigator.languages ? window.navigator.languages[0] : null;

  lang = lang ||
         window.navigator.language ||
         window.navigator.browserLanguage ||
         window.navigator.userLanguage;

  let shortLang = lang;

  if (shortLang.indexOf('-') !== -1) shortLang = shortLang.split('-')[0];
  if (shortLang.indexOf('_') !== -1) shortLang = shortLang.split('_')[0];

  return shortLang;
}

function extend(out) {
  out = out || {};

  for (let i = 1; i < arguments.length; i++) {
    const obj = arguments[i];

    if (!obj) {
      continue;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object') {
          if (obj[key] instanceof Array == true) {
            out[key] = obj[key].slice(0);
          } else {
            out[key] = extend(out[key], obj[key]);
          }
        } else {
          out[key] = obj[key];
        }
      }
    }
  }

  return out;
};

function dataTodayIsIncomplete(variableData, canton, suffix) {
  let todayIncomplete = (v) => {
    return v[v.length - 1][1] == null && v[v.length - 1 - 7][1] != null;
  };
  if (canton !== "CH") {
    return todayIncomplete(variableData[canton + suffix]);
  }
  return cantons.some((c) => {
    return todayIncomplete(variableData[c.id + suffix]);
  });
}

export {
  readCSV,
  getRow,
  getField,
  forwardFill,
  multiplyColumn,
  roundColumn,
  where,
  setIndex,
  groupBy,
  getChart,
  getTargetCoutryDate,
  backwardsResample,
  getUserLanguage,
  extend,
  dataTodayIsIncomplete,
};

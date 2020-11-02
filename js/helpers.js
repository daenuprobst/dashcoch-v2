// EXTREMELY basic (but fast) CSS parser for number and dates ONLY. 
// Do not use with just any data, it will explode spectacularely.
function parseCSV(text, sep = ',') {
    let lines = text.split('\n');
    let rows = []

    for (let i = 0; i < lines.length; i++) {
        // Skip empty lines
        if (lines[i].trim() === '') {
            continue;
        }

        rows.push([])

        let values = lines[i].split(sep);
        for (let j = 0; j < values.length; j++) {
            let value = values[j];

            // TODO: Fix the following mess
            if (value === null || value === '') {
                // No value -> null
                rows[i].push(null);
            } else if (value.match(/\d{4}-\d{2}-\d{2}/)) {
                // Basic date match
                rows[i].push(Date.parse(value));
            } else if (value.match(/^(\d|-\d)/) && !value.includes(' ') && !value.endsWith('+')) {
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
    let response = await fetch(url);
    let text = await response.text();
    let csv = parseCSV(text, sep);

    let obj = {};
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
    return Highcharts.charts[document.getElementById(container).getAttribute('data-highcharts-chart')];
}

function getTargetCoutryDate(daysAgo = 0) {
    return Date.parse(moment(new Date()).subtract(daysAgo, 'day').tz('Europe/Zurich').format('YYYY-MM-DD'));
}

function getRow(data, rowId) {
    let row = {};
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
    let column = data[columnName];
    for (let i = 0; i < column.length; i++) {
        if (column[i][0] === rowId) {
            field = column[i][1];
        }
    }
    return field;
}

function forwardFill(column) {
    let newColumn = column.slice();

    for (let i = 1; i < newColumn.length; i++) {
        if (newColumn[i][1] === null) {
            newColumn[i][1] = newColumn[i - 1][1];
        }
    }

    return newColumn;
}

function backwardsResample(column, windowSize = 7, n = null) {
    let currentWindowSize = windowSize;
    let k = 0;
    let newColumn = [];

    for (let i = column.length - 1 - windowSize; i >= windowSize; i -= windowSize) {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
            sum += column[i - j][1];
        }
        newColumn.push([k++, sum / windowSize]);
        if (newColumn.length === n) {
            break;
        }
    }

    return newColumn.reverse();
}

function multiplyColumn(column, scalar) {
    let newColumn = column.slice();

    for (let i = 0; i < newColumn.length; i++) {
        if (newColumn[i][1] !== null) {
            newColumn[i][1] = newColumn[i][1] * scalar;
        }
    }

    return newColumn;
}

function getUnique(column) {
    return [...new Set(column.map(item => item[1]))];
}

function where(df, filters) {
    let newDf = {};

    for (const col in df) {
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

        for (const col in df) {
            newDf[col].push(df[col][i]);
        }
    }

    return newDf;
}

function setIndex(df, columnName) {
    for (const col in df) {
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
    let newDf = {};
    let columnName = columnNames.shift();
    let uniqueValues = getUnique(df[columnName]);

    for (const uniqueValue of uniqueValues) {
        newDf[uniqueValue] = {};

        for (const col in df) {
            if (col === columnName) continue;
            newDf[uniqueValue][col] = []
        }
    }

    for (let i = 0; i < df[columnName].length; i++) {
        let value = df[columnName][i][1];
        for (const col in df) {
            if (col === columnName) continue;
            newDf[value][col].push(df[col][i])
        }
    }

    if (columnNames.length > 0) {
        for (const uniqueValue of uniqueValues) {
            newDf[uniqueValue] = groupBy_(newDf[uniqueValue], columnNames.slice(), agg);
        }
    } else {
        // Aggregate
        if (agg === 'sum') {
            for (const uniqueValue of uniqueValues) {
                for (const col in newDf[uniqueValue]) {
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

export {
    readCSV, getRow, getField, forwardFill, multiplyColumn, where,
    setIndex, groupBy, getChart, getTargetCoutryDate, backwardsResample
};
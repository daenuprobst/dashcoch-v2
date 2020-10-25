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

            if (value === null || value === '') {
                // No value -> null
                rows[i].push(null);
            } else if (value.match(/\d{4}-\d{2}-\d{2}/)) {
                // Basic date match
                rows[i].push(Date.parse(value));
            } else if (value.match(/^(\d|-\d)/)) {
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

async function readCSV(url) {
    let response = await fetch(url);
    let text = await response.text();
    let csv = parseCSV(text);

    let obj = {};
    for (let i = 1; i < csv[0].length; i++) {
        obj[csv[0][i]] = [];
        for (let j = 1; j < csv.length; j++) {
            obj[csv[0][i]].push([csv[j][0], csv[j][i]]);
        }
    }

    return obj;
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

function forwardFill(column) {
    let new_column = column.slice();

    for (let i = 1; i < new_column.length; i++) {
        if (new_column[i][1] === null) {
            new_column[i][1] = new_column[i - 1][1];
        }
    }

    return new_column;
}

function multiplyColumn(column, scalar) {
    let new_column = column.slice();

    for (let i = 0; i < new_column.length; i++) {
        new_column[i][1] = new_column[i][1] * scalar;
    }

    return new_column;
}

export { readCSV, getRow, forwardFill, multiplyColumn };
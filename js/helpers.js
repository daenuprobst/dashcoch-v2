function helperDiff(series) {
    let data = series.values;
    let newData = [0];

    for (let i = 1; i < data.length; i++) {
        if (isNaN(data[i]))
            newData.push(Number.NaN)
        else
            newData.push(data[i] - data[i - 1]);
    }

    return newData;
}

function helperGetIndexValuePairs(series) {
    let data = []
    for (let i = 0; i < series.values.length; i++) {
        data.push([Date.parse(series.index[i]), series.values[i]]);
    }

    return data
}
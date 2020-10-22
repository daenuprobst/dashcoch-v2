async function getCases() {
    let url = "https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_cases_switzerland_openzh.csv";
    let df = await dfd.read_csv(url);
    df = df.set_index({ key: "Date" });

    // Calc all the diffs
    let columns = df.columns.slice();
    for (let i = 0; i < columns.length; i++) {
        df.addColumn({ column: columns[i] + "_diff", value: helperDiff(df[columns[i]]) });
    }

    return df;
}

async function getFatalities() {
    let url = "https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_fatalities_switzerland_openzh.csv";
    let df = await dfd.read_csv(url);
    df = df.set_index({ key: "Date" });

    // Calc all the diffs
    let columns = df.columns.slice();
    for (let i = 0; i < columns.length; i++) {
        df.addColumn({ column: columns[i] + "_diff", value: helperDiff(df[columns[i]]) });
    }

    return df;
}

async function getHospitalized() {
    let url = "https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_hospitalized_switzerland_openzh.csv";
    let df = await dfd.read_csv(url);
    df = df.set_index({ key: "Date" });

    // Calc all the diffs
    let columns = df.columns.slice();
    for (let i = 0; i < columns.length; i++) {
        df.addColumn({ column: columns[i] + "_diff", value: helperDiff(df[columns[i]]) });
    }

    return df;
}

async function getICU() {
    let url = "https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_icu_switzerland_openzh.csv";
    let df = await dfd.read_csv(url);
    df = df.set_index({ key: "Date" });

    // Calc all the diffs
    let columns = df.columns.slice();
    for (let i = 0; i < columns.length; i++) {
        df.addColumn({ column: columns[i] + "_diff", value: helperDiff(df[columns[i]]) });
    }

    return df;
}

async function getVent() {
    let url = "https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_vent_switzerland_openzh.csv";
    let df = await dfd.read_csv(url);
    df = df.set_index({ key: "Date" });

    // Calc all the diffs
    let columns = df.columns.slice();
    for (let i = 0; i < columns.length; i++) {
        df.addColumn({ column: columns[i] + "_diff", value: helperDiff(df[columns[i]]) });
    }

    return df;
}

async function getLastUpdated() {
    let url = "https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/last_updated.csv";
    let df = await dfd.read_csv(url);

    // There is something wrong with sorting strings in danfo.js,
    // do not return a DataFrame here
    let dummy_df = [];
    for (let i = 0; i < df['Date'].values.length; i++) {
        dummy_df.push({
            canton: df['Canton'].values[i],
            datetime: new Date(df['Date'].values[i] + 'T' + df['Time'].values[i] + ':00')
        });
    }
    dummy_df.sort((a, b) => b['datetime'] - a['datetime']);

    return new dfd.DataFrame(dummy_df);
}

async function getData() {
    let promises = [
        getCases(),
        getFatalities(),
        getHospitalized(),
        getICU(),
        getVent(),
        getLastUpdated() // always keep at the end
    ];

    return await Promise.all(promises);
}
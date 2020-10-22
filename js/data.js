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

async function getData() {
    let promises = [
        getCases(),
        getFatalities(),
        getHospitalized(),
        getICU(),
        getVent()
    ];

    return await Promise.all(promises);
}
import { readCSV, forwardFill, multiplyColumn } from './helpers.js'
import { cantons } from './cantons.js'

async function getCases() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_cases_switzerland_openzh.csv';
    let df = await readCSV(url);

    // Forward-fill the totals
    for (let i = 0; i < cantons.length; i++) {
        let canton = cantons[i]['id'];
        df[canton] = forwardFill(df[canton]);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 10000);
        }
    });

    return df;
}

async function getFatalities() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_fatalities_switzerland_openzh.csv';
    let df = await readCSV(url);

    // Forward-fill the totals
    for (let i = 0; i < cantons.length; i++) {
        let canton = cantons[i]['id'];
        df[canton] = forwardFill(df[canton]);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 10000);
        }
    });

    return df;
}

async function getHospitalized() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_hospitalized_switzerland_openzh.csv';
    let df = await readCSV(url);

    // Forward-fill the totals
    for (let i = 0; i < cantons.length; i++) {
        let canton = cantons[i]['id'];
        df[canton] = forwardFill(df[canton]);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 10000);
        }
    });

    return df;
}

async function getICU() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_icu_switzerland_openzh.csv';
    let df = await readCSV(url);

    // Forward-fill the totals
    for (let i = 0; i < cantons.length; i++) {
        let canton = cantons[i]['id'];
        df[canton] = forwardFill(df[canton]);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 10000);
        }
    });

    return df;
}

async function getVent() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_vent_switzerland_openzh.csv';
    let df = await readCSV(url);

    // Forward-fill the totals
    for (let i = 0; i < cantons.length; i++) {
        let canton = cantons[i]['id'];
        df[canton] = forwardFill(df[canton]);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 10000);
        }
    });

    return df;
}

async function getHospitalizedTotal() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_hospitalized_total_switzerland_openzh.csv';
    let df = await readCSV(url);

    // Forward-fill the totals
    for (let i = 0; i < cantons.length; i++) {
        let canton = cantons[i]['id'];
        df[canton] = forwardFill(df[canton]);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 10000);
        }
    });

    return df;
}

async function getTestPositivityRate() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_tests_switzerland_bag.csv';
    return await readCSV(url);
}

async function getLastUpdated() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/last_updated.csv';
    let data = await readCSV(url);

    let tmp = [];
    for (let i = 0; i < data['Date'].length; i++) {
        tmp.push([
            data['Date'][i][0], // Canton id
            new Date(data['Date'][i][1] + 'T' + data['Time'][i][1] + ':00')
        ]);
    }

    tmp.sort((a, b) => b[1] - a[1]);
    return tmp;
}

async function getData() {
    let promises = [
        getCases(),
        getFatalities(),
        getHospitalizedTotal(),
        getHospitalized(),
        getICU(),
        getVent(),
        getTestPositivityRate(),
        getLastUpdated() // always keep at the end
    ];

    return await Promise.all(promises);
}

export { getData };
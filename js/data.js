import { readCSV, forwardFill, multiplyColumn, where, groupBy } from './helpers.js'
import { cantons } from './cantons.js'

async function getCases() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_cases_switzerland_openzh.csv';
    let df = await readCSV(url);

    // Forward-fill the totals
    for (let i = 0; i < cantons.length; i++) {
        let canton = cantons[i]['id'];
        df[canton] = forwardFill(df[canton]);
        df[canton + '_pc'] = forwardFill(df[canton + '_pc']);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 100000);
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
        df[canton + '_pc'] = forwardFill(df[canton + '_pc']);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 100000);
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
        df[canton + '_pc'] = forwardFill(df[canton + '_pc']);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 100000);
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
        df[canton + '_pc'] = forwardFill(df[canton + '_pc']);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 100000);
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
        df[canton + '_pc'] = forwardFill(df[canton + '_pc']);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 100000);
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
        df[canton + '_pc'] = forwardFill(df[canton + '_pc']);
    }

    // Multiply per capity columns to get per 10,000 values
    Object.keys(df).forEach(function (key, index) {
        if (key.includes('_pc')) {
            df[key] = multiplyColumn(df[key], 100000);
        }
    });

    return df;
}

async function getTestPositivityRate() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_tests_switzerland_bag.csv';
    let df = await readCSV(url, [1]);

    df['frac_negative'] = multiplyColumn(df['frac_negative'], 100);

    return df;
}

async function getAgeSexDist() {
    let url = 'https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/covid19_cases_fatalities_switzerland_bag.csv';
    let df = await readCSV(url);
    let data = {};
    for (const canton of cantons) {
        data[canton.id] = groupBy(where(df, [
            ['canton', e => e === canton.id],
            ['age_group', e => {
                return e !== 'Unbekannt'
            }]
        ]), ['sex', 'age_group'], 'sum');
    }

    let dataByDate = {};
    for (const canton of cantons) {
        dataByDate[canton.id] = groupBy(where(df, [
            ['canton', e => e === canton.id],
            ['age_group', e => {
                return e !== 'Unbekannt'
            }]
        ]), ['sex', 'age_group', 'date'], 'sum');
    }

    return [data, dataByDate];
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

async function getOurworldindata() {
    let url = 'https://covid.ourworldindata.org/data/owid-covid-data.csv';
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
        getAgeSexDist(),
        getLastUpdated()
    ];

    let results = await Promise.all(promises);

    return {
        cases: results[0],
        fatalities: results[1],
        hospitalizedTotal: results[2],
        hospitalized: results[3],
        icu: results[4],
        vent: results[5],
        testPositivityRate: results[6],
        ageSexDist: results[7][0],
        ageSexDateDist: results[7][1],
        lastUpdated: results[8]
    }
}

async function getGlobalData() {
    let promises = [

    ];

    return await Promise.all(promises);
}

export { getData };
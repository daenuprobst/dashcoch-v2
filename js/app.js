import { getData } from './data.js';
import initDaily from './daily.js';
import initMap from './map.js';
import { cantons } from './cantons.js';
import { getRow, getField, getChart, getTargetCoutryDate, backwardsResample } from './helpers.js';
import initTestPositivityRate from './test-positivity-rate.js';
import initNumberOfTests from './number-of-tests.js';
import initAgeSexDist from './age-sex-dist.js';
import initCantonComparison from './canton-comparison.js';
import initSummary from './summary.js'

(function (window) {
    'use strict';
    let data = null;
    let daily_y_axis = {
        cases: 'Cases', fatalities: 'Fatalities', hospitalizedTotal: 'Hospitalizations (All)',
        hospitalized: 'Hospitalizations (Normal)', icu: 'Hospitalizations (ICU)',
        vent: 'Hospitalizations (Venitalted)'
    };

    window.dashcoch = {}
    window.dashcoch.state = JSON.parse(localStorage.getItem('state')) ||
    {
        daily_variable_select: 'cases', daily_canton: 'CH',
        daily_total: false, daily_per_capita: false
    };

    function init() {
        getData().then(dfs => {
            data = dfs;

            initSummaries();

            initDaily('daily', e => {
                // Range selector changed
                console.log(e);
            });
            dashcoch.updateDaily();

            initMap('map', () => {
                // Geojson for map finished loading
                dashcoch.updateMap();
            }, canton => {
                // Selection changed
                dashcoch.state.daily_canton = canton;
                dashcoch.updateDaily();
                dashcoch.updateAgeSexDist();
                dashcoch.updateCantonComparison();
            });

            initTestPositivityRate('test-positivity-rate');
            dashcoch.updateTestPositivityRate();

            initNumberOfTests('number-of-tests');
            dashcoch.updateNumberOfTests();

            initAgeSexDist('age-sex-dist');
            dashcoch.updateAgeSexDist();

            initCantonComparison('canton-comparison', cantons.map(canton => canton.id));
            dashcoch.updateCantonComparison();
        });
    }

    dashcoch.updateAgeSexDist = function () {
        let chart = getChart('age-sex-dist');
        let title = document.getElementById('age-sex-dist-title');

        title.innerHTML = daily_y_axis[dashcoch.state.daily_variable_select] + ' in ' +
            cantons.find(c => c.id == dashcoch.state.daily_canton).name;

        if (!['cases', 'fatalities'].includes(dashcoch.state.daily_variable_select)) {
            chart.series[0].update({ data: [] });
            chart.series[1].update({ data: [] });
            return;
        }

        let maleData = Object.keys(data.ageSexDist[dashcoch.state.daily_canton][1]).map(key => {
            return data.ageSexDist[dashcoch.state.daily_canton][1][key][dashcoch.state.daily_variable_select]
        });

        let femaleData = Object.keys(data.ageSexDist[dashcoch.state.daily_canton][1]).map(key => {
            return data.ageSexDist[dashcoch.state.daily_canton][2][key][dashcoch.state.daily_variable_select]
        });

        chart.series[0].update({
            name: 'Male',
            data: maleData.map(item => -item)
        });
        chart.series[1].update({
            name: 'Female',
            data: femaleData
        });
    }

    dashcoch.updateTestPositivityRate = function () {
        let chart = getChart('test-positivity-rate');
        chart.series[0].update({
            name: 'Test Positivity Rate',
            data: data.testPositivityRate['frac_negative']
        });
    }

    dashcoch.updateNumberOfTests = function () {
        let chart = getChart('number-of-tests');
        chart.series[0].update({
            name: 'Number of Negative Tests',
            data: data.testPositivityRate['n_negative']
        });
        chart.series[1].update({
            name: 'Number of Positive Tests',
            data: data.testPositivityRate['n_positive']
        });
    }

    dashcoch.updateCantonComparison = function () {
        let chart = getChart('canton-comparison');
        let rowToday = getRow(data[dashcoch.state.daily_variable_select], getTargetCoutryDate());
        let seriesData = [];
        let seriesColor = [];

        for (const canton of cantons) {
            seriesData.push(rowToday[canton.id + '_pc'])
            if (canton.id === dashcoch.state.daily_canton) {
                seriesColor.push('#2fad94');
            } else {
                seriesColor.push('#f95d6a');
            }
        }

        chart.series[0].update({
            name: 'Cases',
            data: seriesData,
            colorByPoint: true,
            colors: seriesColor
        });
    }

    dashcoch.updateDaily = function () {
        let title = document.getElementById('daily-canton-title');
        let chart = getChart('daily');
        let suffix = getSuffix();

        title.innerHTML = daily_y_axis[dashcoch.state.daily_variable_select] + ' in ' +
            cantons.find(c => c.id == dashcoch.state.daily_canton).name;

        chart.series[0].update({
            type: suffix.includes('diff') ? 'column' : 'area',
            name: dashcoch.state.daily_canton,
            data: data[dashcoch.state.daily_variable_select][dashcoch.state.daily_canton + suffix]
        });

        chart.yAxis[0].axisTitle.attr({
            text: daily_y_axis[dashcoch.state.daily_variable_select]
        });

        chart.redraw()
    }

    dashcoch.updateMap = function () {
        let chart = getChart('map');
        let rowToday = getRow(data[dashcoch.state.daily_variable_select], getTargetCoutryDate());
        let rowYesterday = getRow(data[dashcoch.state.daily_variable_select], getTargetCoutryDate(1));
        let rowLastWeek = getRow(data[dashcoch.state.daily_variable_select], getTargetCoutryDate(7));
        let series_data = [];
        let suffix = getSuffix();

        for (const canton of cantons) {
            if (canton.id === 'CH') continue;
            let property = canton.id + suffix;
            series_data.push([canton.id, rowToday[property], rowYesterday[property], rowLastWeek[property]]);
        }

        chart.series[0].update({
            name: 'Cases',
            data: series_data
        });
        chart.redraw();
    }

    // Select the daily variable
    document.getElementById('daily-variable-select').addEventListener('change', event => {
        dashcoch.state.daily_variable_select = event.target.value;
        dashcoch.updateDaily();
        dashcoch.updateMap();
        dashcoch.updateAgeSexDist();
        dashcoch.updateCantonComparison();
    });

    // Whether to display daily change or cumulative values
    document.getElementById('daily-total-toggle').addEventListener('change', event => {
        dashcoch.state.daily_total = event.target.checked;
        dashcoch.updateDaily();
        dashcoch.updateMap();
        dashcoch.updateCantonComparison();
    });

    // Whether to display daily date per-capita
    document.getElementById('daily-per-capita-toggle').addEventListener('change', event => {
        dashcoch.state.daily_per_capita = event.target.checked;
        dashcoch.updateDaily();
        dashcoch.updateMap();
        dashcoch.updateCantonComparison();
    });

    function initSummaries() {
        initSummary('summary-today', 'Today',
            getField(data.cases, getTargetCoutryDate(), 'CH_diff'),
            getField(data.fatalities, getTargetCoutryDate(), 'CH_diff'),
            getField(data.hospitalizedTotal, getTargetCoutryDate(), 'CH_diff'),
            getReportingRegions(), 26
        );

        initSummary('summary-yesterday', 'Yesterday',
            getField(data.cases, getTargetCoutryDate(1), 'CH_diff'),
            getField(data.fatalities, getTargetCoutryDate(1), 'CH_diff'),
            getField(data.hospitalizedTotal, getTargetCoutryDate(1), 'CH_diff'),
            getReportingRegions(1), 26
        );

        initSummary('summary-last-week', 'Same Day Last Week',
            getField(data.cases, getTargetCoutryDate(7), 'CH_diff'),
            getField(data.fatalities, getTargetCoutryDate(7), 'CH_diff'),
            getField(data.hospitalizedTotal, getTargetCoutryDate(7), 'CH_diff'),
            getReportingRegions(7), 26
        );

        let weeklyCases = backwardsResample(data.cases.CH_diff, 7, 2)
        let weeklyFatalities = backwardsResample(data.fatalities.CH_diff, 7, 2)
        let weeklyHospitalizations = backwardsResample(data.hospitalizedTotal.CH_diff, 7, 2)

        initSummary('summary-week', 'Last 7 Days Averages',
            weeklyCases[1][1],
            weeklyFatalities[1][1],
            weeklyHospitalizations[1][1]
        );

        initSummary('summary-previous-week', 'Previous 7 Days Averages',
            weeklyCases[0][1],
            weeklyFatalities[0][1],
            weeklyHospitalizations[0][1]
        );
    }

    function getSuffix() {
        let suffix = '_diff';
        if (dashcoch.state.daily_total) suffix = '';
        if (dashcoch.state.daily_per_capita) suffix += '_pc'
        return suffix;
    }

    function getReportingRegions(daysAgo = 0) {
        // Assuming that cantons that report cases report all other variables
        // same time as well
        let row = getRow(data.cases, getTargetCoutryDate(daysAgo));
        let reported = [];

        for (const [key, value] of Object.entries(row))
            if (key.endsWith('_diff') && value !== null && key.slice(0, 2) !== 'CH')
                reported.push(key.slice(0, 2));

        return reported;
    }

    function saveState() {
        localStorage.setItem('state', JSON.stringify(dashcoch.state));
    }

    init()
})(window);
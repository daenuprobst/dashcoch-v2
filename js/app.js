import { getData } from './data.js';
import initDaily from './daily.js';
import initMap from './map.js';
import { cantons } from './cantons.js';
import { getRow, getField, getChart, getTargetCoutryDate, backwardsResample } from './helpers.js';
import initTestPositivityRate from './test-positivity-rate.js';
import initNumberOfTests from './number-of-tests.js';
import initAgeSexDist from './age-sex-dist.js';
import initCantonComparison from './canton-comparison.js';
import initHeatmap from './heatmap.js';
import initHeatmapAgeSex from './heatmap-age-sex.js';
import initSummary from './summary.js';

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
        daily_canton: 'CH',
        daily_variable_select: 'cases',
        daily_total: false, daily_per_capita: false,
        heatmap_variable_select: 'cases',
        heatmap_total: false, heatmap_per_capita: true,
        heatmap_sex_select: 1
    };

    function init() {
        getData().then(dfs => {
            data = dfs;

            initSummaries();

            initDaily('daily', e => {
                // Range selector changed
                // console.log(e);
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

            initHeatmap('heatmap', cantons.filter(e => e.id !== 'CH').map(e => e.id));
            dashcoch.updateHeatmap();

            initHeatmapAgeSex('heatmap-age-sex', Object.keys(data.ageSexDist.CH[1]));
            dashcoch.updateHeatmapAgeSex();
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
        let suffix = getDailySuffix();

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
        let suffix = getDailySuffix();

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

    dashcoch.updateHeatmap = function () {
        // This is a bit hacky, as there is currently no way to use nice diverging color
        // scales in Highcharts heatmaps... Weird.
        let tmp = dashcoch.state.heatmap_variable_select;
        if (tmp.includes('hosp') || tmp.includes('icu') || tmp.includes('vent')) {
            dashcoch.state.heatmap_total = true;
            document.getElementById('heatmap-total-toggle').checked = true;
        }

        let chart = getChart('heatmap');
        let series_data = [];
        let suffix = getHeatmapSuffix();

        let i = 0;
        for (const canton of cantons) {
            if (canton.id === 'CH') continue;
            series_data = series_data.concat(data[dashcoch.state.heatmap_variable_select][canton.id + suffix].map(v => [v[0], i, v[1]]));
            i++;
        }
        chart.series[0].update({
            name: 'Cases',
            data: series_data
        });
        chart.redraw();
    }

    dashcoch.updateHeatmapAgeSex = function () {
        let chart = getChart('heatmap-age-sex');
        let series_data = [];

        let i = 0;
        for (const [key_age, value_age] of Object.entries(data.ageSexDateDist['CH'][dashcoch.state.heatmap_sex_select])) {
            for (const [key_date, value_date] of Object.entries(value_age)) {
                series_data.push([parseFloat(key_date), i, value_date['cases']])
            }
            i++;
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
    document.getElementById('daily-total-toggle').addEventListener('change', event => {
        dashcoch.state.daily_total = event.target.checked;
        dashcoch.updateDaily();
        dashcoch.updateMap();
        dashcoch.updateCantonComparison();
    });
    document.getElementById('daily-per-capita-toggle').addEventListener('change', event => {
        dashcoch.state.daily_per_capita = event.target.checked;
        dashcoch.updateDaily();
        dashcoch.updateMap();
        dashcoch.updateCantonComparison();
    });

    // Select the heatmap variable
    document.getElementById('heatmap-variable-select').addEventListener('change', event => {
        dashcoch.state.heatmap_variable_select = event.target.value;
        dashcoch.updateHeatmap();
    });
    document.getElementById('heatmap-total-toggle').addEventListener('change', event => {
        dashcoch.state.heatmap_total = event.target.checked;
        dashcoch.updateHeatmap();
    });
    document.getElementById('heatmap-per-capita-toggle').addEventListener('change', event => {
        dashcoch.state.heatmap_per_capita = event.target.checked;
        dashcoch.updateHeatmap();
    });

    // Heatmap age sex
    document.getElementById('heatmap-sex-select').addEventListener('change', event => {
        dashcoch.state.heatmap_sex_select = event.target.value;
        dashcoch.updateHeatmapAgeSex();
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

    function getDailySuffix() {
        let suffix = '_diff';
        if (dashcoch.state.daily_total) suffix = '';
        if (dashcoch.state.daily_per_capita) suffix += '_pc'
        return suffix;
    }

    function getHeatmapSuffix() {
        let suffix = '_diff';
        if (dashcoch.state.heatmap_total) suffix = '';
        if (dashcoch.state.heatmap_per_capita) suffix += '_pc'
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
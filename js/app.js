import { getData } from './data.js';
import initDaily from './daily.js';
import initMap from './map.js';
import { cantons } from './cantons.js';
import { getRow, getChart, getTargetCoutryDate } from './helpers.js';
import initTestPositivityRate from './test-positivity-rate.js';
import initNumberOfTests from './number-of-tests.js';
import initAgeSexDist from './age-sex-dist.js';
import initCantonComparison from './canton-comparison.js';

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
            let cases = data[0];
            let updates = data[data.length - 1];

            initDaily('daily', e => {
                // Range selector changed
                console.log(e);
            });
            dashcoch.updateDaily();

            // As geojson data is loaded async, supply callback
            initMap('map', () => {
                dashcoch.updateMap();
            });

            initTestPositivityRate('test-positivity-rate');
            dashcoch.updateTestPositivityRate();

            initNumberOfTests('number-of-tests');
            dashcoch.updateNumberOfTests();

            initAgeSexDist('age-sex-dist');
            dashcoch.updateAgeSexDist();

            initCantonComparison('canton-comparison', () => {
                let chart = getChart('canton-comparison');
                let series = [];
                for (const canton of cantons) {
                    if (canton.id === 'CH') continue;
                    series.push({
                        name: canton.id,
                        data: data[dashcoch.state.daily_variable_select][canton.id + getSuffix()],
                        color: (canton.id === dashcoch.state.daily_canton) ? '#f95d6a' : '#003f5c'
                    });
                }
                return series;
            });
        });
    }

    dashcoch.updateAgeSexDist = function () {
        let chart = getChart('age-sex-dist');
        let title = document.getElementById('age-sex-dist-title');

        title.innerHTML = daily_y_axis[dashcoch.state.daily_variable_select] + ' in ' +
            cantons.find(c => c.id == dashcoch.state.daily_canton).name +
            '<span class="badge badge-secondary badge-pill float-right">FOPH Data</span>';

        if (!['cases', 'fatalities'].includes(dashcoch.state.daily_variable_select)) {
            halfmoon.initStickyAlert({
                title: 'Info',
                content: 'Age and sex distribution for hospitalisations is not available.',
                alertType: 'alert-secondary',
            });
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
        // let chart = getChart('canton-comparison');
        // let i = 0;
        // for (const canton of cantons) {
        //     if (canton.id == 'CH') continue;
        //     chart.series[i++].update({
        //         color: '#ff0000'
        //     });
        // }
    }

    dashcoch.updateDaily = function () {
        let title = document.getElementById('daily-canton-title');
        let chart = getChart('daily');

        title.innerHTML = daily_y_axis[dashcoch.state.daily_variable_select] + ' in ' +
            cantons.find(c => c.id == dashcoch.state.daily_canton).name +
            '<span class="badge badge-pill float-right">Cantonal Data</span>';

        chart.series[0].update({
            name: dashcoch.state.daily_canton,
            data: data[dashcoch.state.daily_variable_select][dashcoch.state.daily_canton + getSuffix()]
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

        for (let i = 0; i < cantons.length; i++) {
            let canton = cantons[i].id;
            if (canton === 'CH') continue;
            let property = canton + getSuffix();
            series_data.push([canton, rowToday[property], rowYesterday[property], rowLastWeek[property]]);
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

    function getSuffix() {
        let suffix = '_diff';
        if (dashcoch.state.daily_total) suffix = '';
        if (dashcoch.state.daily_per_capita) suffix += '_pc'
        return suffix;
    }

    function saveState() {
        localStorage.setItem('state', JSON.stringify(dashcoch.state));
    }

    init()
})(window);
import { getData } from './data.js';
import { initDailyList } from './daily-list.js';
import { initDaily } from './daily.js';
import { initMap } from './map.js';
import { cantons } from './cantons.js';
import { getRow } from './helpers.js';
import { initTestPositivityRate } from './test-positivity-rate.js';
import { initNumberOfTests } from './number-of-tests.js';

(function (window) {
    'use strict';
    let daily_y_axis = ['Cases', 'Fatalities', 'Hospitalizations (All)', 'Hospitalizations (Normal)', 'Hospitalizations (ICU)', 'Hospitalizations (Venitalted)'];
    let data = null;
    window.dashcoch = {}
    window.dashcoch.state = JSON.parse(localStorage.getItem('state')) ||
        { daily_variable_select: 0, daily_canton: 'CH', daily_total: false, daily_per_capita: false };

    function init() {
        getData().then(dfs => {
            data = dfs;
            let cases = data[0];
            let updates = data[data.length - 1];

            initDaily('daily');
            dashcoch.updateDaily();

            // As geojson data is loaded async, supply callback
            initMap('map', () => {
                dashcoch.updateMap();
            });

            initTestPositivityRate('test-positivity-rate');
            dashcoch.updateTestPositivityRate();

            initNumberOfTests('number-of-tests');
            dashcoch.updateNumberOfTests();
        });
    }

    dashcoch.updateTestPositivityRate = function () {
        let testPositivityRate = data[6];
        let chart = Highcharts.charts[document.getElementById('test-positivity-rate').getAttribute('data-highcharts-chart')];
        chart.series[0].update({
            name: 'Test Positivity Rate',
            data: testPositivityRate['frac_negative']
        });
    }

    dashcoch.updateNumberOfTests = function () {
        let testPositivityRate = data[6];
        let chart = Highcharts.charts[document.getElementById('number-of-tests').getAttribute('data-highcharts-chart')];
        chart.series[0].update({
            name: 'Number of Negative Tests',
            data: testPositivityRate['n_negative']
        });
        chart.series[1].update({
            name: 'Number of Positive Tests',
            data: testPositivityRate['n_positive']
        });
    }

    dashcoch.updateDaily = function () {
        let suffix = '_diff';
        if (dashcoch.state.daily_total) {
            suffix = '';
        }

        if (dashcoch.state.daily_per_capita) {
            suffix += '_pc'
        }

        let title = document.getElementById('daily-canton-title');
        title.innerHTML = cantons.find(c => c.id == dashcoch.state.daily_canton).name;

        let chart = Highcharts.charts[document.getElementById('daily').getAttribute('data-highcharts-chart')];
        chart.series[0].update({
            name: dashcoch.state.daily_canton,
            data: data[dashcoch.state.daily_variable_select][dashcoch.state.daily_canton + suffix]
        });
        chart.yAxis[0].axisTitle.attr({
            text: daily_y_axis[dashcoch.state.daily_variable_select]
        });
        chart.redraw()
    }

    dashcoch.updateMap = function () {
        let chart = Highcharts.charts[document.getElementById('map').getAttribute('data-highcharts-chart')];
        let today = Date.parse(moment(new Date()).tz('Europe/Zurich').format('YYYY-MM-DD'));
        let yesterday = Date.parse(moment(new Date()).subtract(1, 'day').tz('Europe/Zurich').format('YYYY-MM-DD'));
        let lastWeek = Date.parse(moment(new Date()).subtract(7, 'day').tz('Europe/Zurich').format('YYYY-MM-DD'));
        let rowToday = getRow(data[dashcoch.state.daily_variable_select], today);
        let rowYesterday = getRow(data[dashcoch.state.daily_variable_select], yesterday);
        let rowLastWeek = getRow(data[dashcoch.state.daily_variable_select], lastWeek);

        let suffix = '_diff';
        if (dashcoch.state.daily_total) {
            suffix = '';
        }

        if (dashcoch.state.daily_per_capita) {
            suffix += '_pc'
        }

        let series_data = [];

        for (let i = 0; i < cantons.length; i++) {
            let canton = cantons[i].id;
            if (canton === 'CH') continue;
            series_data.push([canton, rowToday[canton + suffix], rowYesterday[canton + suffix], rowLastWeek[canton + suffix]]);
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
    });

    // Whether to display daily change or cumulative values
    document.getElementById('daily-total-toggle').addEventListener('change', event => {
        dashcoch.state.daily_total = event.target.checked;
        dashcoch.updateDaily();
        dashcoch.updateMap();
    });

    // Whether to display daily date per-capita
    document.getElementById('daily-per-capita-toggle').addEventListener('change', event => {
        dashcoch.state.daily_per_capita = event.target.checked;
        dashcoch.updateDaily();
        dashcoch.updateMap();
    });

    function saveState() {
        localStorage.setItem('state', JSON.stringify(dashcoch.state));
    }

    init()
})(window);
(function (window) {
    'use strict';
    let daily_y_axis = ["Cases", "Fatalities", "Hospitalizations"];
    let data = null;
    let state = JSON.parse(localStorage.getItem('state')) ||
        { daily_variable_select: 0, daily_canton: 'CH' };

    function init() {
        getData().then(dfs => {
            data = dfs;
            let cases = data[0];
            let updates = data[data.length - 1];

            initDailyList(cases, updates, 'daily-list');
            initDaily(cases, 'daily', cases => {
                let series = [];
                return [{
                    name: 'CH',
                    data: helperGetIndexValuePairs(cases['CH_diff'])
                }];
            });
        });
    }

    window.updateDaily = function (canton = '', index = -1) {
        if (index < 0) {
            index = state.daily_variable_select;
        } else {
            state.daily_variable_select = index;
        }

        if (canton === '') {
            canton = state.daily_canton;
        } else {
            state.daily_canton = canton;
        }

        let chart = $('#daily').highcharts();
        chart.series[0].update({
            name: canton,
            data: helperGetIndexValuePairs(data[index][canton + '_diff'])
        });
        chart.yAxis[0].axisTitle.attr({
            text: daily_y_axis[index]
        });
        chart.redraw()
    }

    function updateDailyList(index) {
        document.getElementById('daily-list').innerHTML = '';
        initDailyList(data[index], data[data.length - 1], 'daily-list');
    }

    $('#daily-variable-select').change(function () {
        let val = $(this).val();

        state.daily_variable_select = val;
        updateDaily('', val);
        updateDailyList(val);
    });

    function saveState() {
        localStorage.setItem('state', JSON.stringify(state));
    }

    init()
})(window);
(function (window) {
    'use strict';
    let daily_y_axis = ["Cases", "Fatalities", "Hospitalizations"];
    let data = null;
    let state = JSON.parse(localStorage.getItem('state')) ||
        { property: '', properties: [] };

    function init() {
        getData().then(dfs => {
            data = dfs;
            let cases = data[0];
            // initMap(cases, 'map', cases => {
            //     let row = cases.loc({ rows: ['2020-10-21'] })
            //     let data = []
            //     Object.keys(cantons).forEach(function (key) {
            //         let canton = key;
            //         let x = cantons[key].offsetX;
            //         let y = cantons[key].offsetY;
            //         let value = row[key + '_diff'].data[0];
            //         data.push({ id: canton, value: value, dataLabels: { x: x, y: y } });
            //     });
            //     return [{
            //         name: '2020-10-21',
            //         data: data
            //     }];
            // });
            initDailyList(cases, 'daily-list');
            initDaily(cases, 'daily', cases => {
                let series = [];
                return [{
                    name: 'CH',
                    data: helperGetIndexValuePairs(cases['CH_diff'])
                }];
            });
        });
    }

    function updateDaily(index) {
        let chart = $('#daily').highcharts();
        chart.series[0].update({
            name: 'CH',
            data: helperGetIndexValuePairs(data[index]['CH_diff'])
        });
        chart.yAxis[0].axisTitle.attr({
            text: daily_y_axis[index]
        });
        chart.redraw()
    }

    $('#daily-variable-select').change(function () {
        updateDaily($(this).val());
    });

    function saveState() {
        localStorage.setItem('state', JSON.stringify(state));
    }

    init()
})(window);
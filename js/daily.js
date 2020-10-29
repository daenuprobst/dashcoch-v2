export default function initDaily(container, extremesChangeCallback) {
    Highcharts.stockChart(container, {
        chart: {
            type: 'column',
            animation: false,
            zoomType: 'x',
            // spacing: [0, 0, 0, 0],
            events: {
                load: function () {
                }
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                borderWidth: 0,
                pointPadding: 0.0,
                color: '#f95d6a'
            }
        },
        boost: {
            enabled: true,
        },
        title: {
            text: ''
        },
        xAxis: {
            title: {
                text: 'Date'
            },
            type: 'datetime',
            events: {
                setExtremes: function (e) {
                    extremesChangeCallback(e);
                }
            }
        },
        yAxis: {
            title: {
                text: 'Cases'
            },
            labels: {
                style: {
                    color: '#ffffff',
                    textOutline: '2px contrast'
                }
            },
            showFirstLabel: false,
            gridLineColor: '#262626',
        },
        legend: {
            enabled: false,
        },
        rangeSelector: {
            buttons: [{
                type: 'month',
                count: 1,
                text: '1m'
            }, {
                type: 'month',
                count: 3,
                text: '3m'
            }, {
                type: 'all',
                text: 'All'
            }],
            inputEnabled: false,
            selected: 0,
        },
        series: [{}]
    });
}
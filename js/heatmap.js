import turbo from './cm-turbo.js'

export default function (container, categories, colsize=24 * 36e5, reverseYAxis=true, xAxisType='datetime') {
    Highcharts.chart(container, {
        chart: {
            type: 'heatmap',
            height: 500,
            zoomType: 'x',
            resetZoomButton: {
                position: {
                    align: 'left',
                    x: 5,
                    y: 5
                }
            }
        },
        rangeSelector: {
            enabled: true,
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
            selected: 1,
        },
        boost: {
            useGPUTranslations: true
        },
        title: {
            text: '',
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
        },
        plotOptions: {
            series: {
                boostThreshold: 100,
                borderWidth: 0,
                nullColor: '#191c20',
                colsize: colsize,
                turboThreshold: Number.MAX_VALUE // #3404, remove after 4.0.5 release
            },
        },
        tooltip: {
            formatter: function () {
                return '<b>' + categories[this.point.y] + '</b><br />' +
                    (xAxisType === 'datetme' ? moment(this.point.x).format('LL') : moment().day('Monday').week(this.point.x)).format('LL') + '<br />' +
                    (Math.round(this.point.value * 100) / 100);
            }
        },
        xAxis: {
            type: xAxisType,
            title: { text: 'Date' }
        },

        yAxis: {
            categories: categories,
            title: {
                text: null
            },
            opposite: true,
            minPadding: 0,
            maxPadding: 0,
            startOnTick: false,
            endOnTick: false,
            tickWidth: 0,
            reversed: reverseYAxis
        },

        colorAxis: {
            stops: turbo,
        },

        series: [{}]

    });
}
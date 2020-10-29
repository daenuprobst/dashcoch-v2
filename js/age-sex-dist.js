export default function initAgeSexDist(container) {
    // Age categories
    var categories = [
        '0 – 9', '10 – 19', '20 – 29', '30 – 39', '40 – 49', '50 – 59', '60 – 69', '70 – 79', '80+'
    ];

    Highcharts.chart(container, {
        chart: {
            type: 'bar'
        },
        colors: [
            '#665191',
            '#ff7c43'
        ],
        credits: {
            enabled: false
        },
        title: {
            text: ''
        },
        xAxis: [{
            categories: categories,
            reversed: false,
            labels: {
                step: 1
            }
        }, { // mirror axis on right side
            opposite: true,
            reversed: false,
            categories: categories,
            linkedTo: 0,
            labels: {
                step: 1
            },
        }],
        yAxis: {
            title: {
                text: null
            },
            labels: {
                formatter: function () {
                    return Math.abs(this.value);
                }
            },
            gridLineColor: '#262626',
        },
        plotOptions: {
            bar: {
                borderWidth: 0,
                pointPadding: 0.0,
                stacking: 'normal',
            }
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + ', age  range ' + this.point.category + '</b><br/>' +
                    Math.abs(this.point.y);
            }
        },
        series: [{}, {}]
    });
}
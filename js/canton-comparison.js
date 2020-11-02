export default function initCantonComparison(container, categories) {
    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false,
        },
        xAxis: {
            categories: categories,
            crosshair: true
        },
        yAxis: {
            min: 0,
            opposite: true,
            title: {
                text: 'Cases per 100 000 Inhabitants'
            },
            gridLineColor: '#262626',
        },
        tooltip: {
            nullFormat: 'No data available',
            pointFormat: '<b>{point.key}</b><br>' +
                '{point.y:.2f} per 100 000 Inhabitants'
        },
        plotOptions: {
            column: {
                borderWidth: 0,
                pointPadding: 0.0,
                color: '#f95d6a'
            }
        },
        series: [{}]
    });
}
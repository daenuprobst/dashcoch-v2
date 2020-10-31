export default function (container, categories) {
    Highcharts.chart(container, {
        chart: {
            type: 'heatmap',
            zoomType: 'x',
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
            enabled: false,
        },
        plotOptions: {
            series: {
                boostThreshold: 100,
                borderWidth: 0,
                nullColor: '#000000',
                colsize: 24 * 36e5, // one day
                turboThreshold: Number.MAX_VALUE // #3404, remove after 4.0.5 release
            },
        },
        tooltip: {
            formatter: function () {
                return categories[this.point.y] + '<br />';
            }
        },
        xAxis: {
            type: 'datetime',
            // min: Date.UTC(2017, 0, 1),
            // max: Date.UTC(2017, 11, 31, 23, 59, 59),
            // labels: {
            //     align: 'left',
            //     x: 5,
            //     y: 14,
            //     format: '{value:%B}' // long month
            // },
            // showLastLabel: false,
            // tickLength: 16
        },

        yAxis: {
            categories: categories,
            title: {
                text: null
            },
            minPadding: 0,
            maxPadding: 0,
            startOnTick: false,
            endOnTick: false,
            tickWidth: 0,
            reversed: true
        },

        colorAxis: {
            stops: [
                [0, '#003f5c'],
                [0.5, '#f95d6a'],
                [1.0, '#ffa600']
            ],
            // min: -15,
            // max: 25,
            // startOnTick: false,
            // endOnTick: false,
            // labels: {
            //     format: '{value}℃'
            // }
        },

        series: [{}]

    });
}
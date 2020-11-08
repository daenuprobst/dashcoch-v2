import modern from './cm-modern.js';

export default function(container, categories) {
  Highcharts.chart(container, {
    chart: {
      type: 'heatmap',
      height: 350,
      zoomType: 'x',
      resetZoomButton: {
        position: {
          align: 'left',
          x: 5,
          y: 5,
        },
      },
    },
    boost: {
      useGPUTranslations: true,
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: true,
    },
    plotOptions: {
      series: {
        boostThreshold: 100,
        borderWidth: 0,
        nullColor: '#191c20',
        turboThreshold: Number.MAX_VALUE, // #3404, remove after 4.0.5 release
      },
    },
    tooltip: {
      formatter: function() {
        return '<b>' + categories[this.point.y] + '</b><br />' +
                    moment().day('Monday').week(this.point.x)
                        .format('LL') + '<br />' +
                    (Math.round(this.point.value * 100) / 100);
      },
    },
    xAxis: {
      title: {text: 'Week'},
    },

    yAxis: {
      categories: categories,
      title: {
        text: null,
      },
      opposite: true,
      minPadding: 0,
      maxPadding: 0,
      startOnTick: false,
      endOnTick: false,
      tickWidth: 0,
      reversed: false,
      gridLineColor: '#262626',
    },

    colorAxis: {
      stops: modern,
    },

    series: [{}],

  });
}

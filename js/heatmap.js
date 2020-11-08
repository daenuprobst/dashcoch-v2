import modern from './cm-modern.js';

export default function(container, categories) {
  Highcharts.chart(container, {
    chart: {
      type: 'heatmap',
      height: 500,
      zoomType: 'x',
      resetZoomButton: {
        position: {
          align: 'left',
          x: 5,
          y: 5,
        },
      },
    },
    rangeSelector: {
      enabled: true,
      buttons: [
        {
          type: 'month',
          count: 1,
          text: '1m',
        },
        {
          type: 'month',
          count: 3,
          text: '3m',
        },
        {
          type: 'all',
          text: 'All',
        },
      ],
      inputEnabled: false,
      selected: 1,
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
        colsize: 24 * 36e5,
        turboThreshold: Number.MAX_VALUE, // #3404, remove after 4.0.5 release
      },
    },
    tooltip: {
      formatter: function() {
        return `<b>${_dc.t('cantons.' + categories[this.point.y])}</b><br />
                ${moment(this.point.x).format('LL')}<br />
                ${Math.round(this.point.value * 100) / 100}`;
      },
    },
    xAxis: {
      type: 'datetime',
      title: {text: 'Date'},
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
      reversed: true,
      gridLineColor: '#262626',
    },

    colorAxis: {
      stops: modern,
    },

    series: [{}],
  });
}

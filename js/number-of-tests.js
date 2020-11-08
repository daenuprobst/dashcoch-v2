export default function initNumberOfTests(container) {
  Highcharts.stockChart(container, {
    chart: {
      type: 'column',
      animation: false,
      zoomType: 'x',
      // spacing: [0, 0, 0, 0],
      events: {
        load: function() {},
      },
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    colors: ['#003f5c', '#f95d6a'],
    credits: {
      enabled: false,
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        pointPadding: 0.0,
        stacking: 'normal',
      },
    },
    boost: {
      enabled: true,
    },
    title: {
      text: '',
    },
    xAxis: {
      title: {
        text: _dc.t('number_of_test.x_axis'),
      },
      type: 'datetime',
    },
    yAxis: {
      title: {
        text: _dc.t('number_of_test.y_axis'),
      },
      labels: {
        style: {
          color: '#ffffff',
          textOutline: '2px contrast',
        },
      },
      showFirstLabel: false,
      gridLineColor: '#262626',
    },
    legend: {
      enabled: false,
    },
    rangeSelector: {
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
      selected: 0,
    },
    series: [{}, {}],
  });
}

export default function initExcessMortality(container) {
  Highcharts.chart(container, {
    chart: {
      zoomType: 'x',
      resetZoomButton: {
        position: {
          align: 'left',
          x: 5,
          y: 5,
        },
      },
    },
    plotOptions: {
      series: {
        lineWidth: 1.5,
        marker: {
          enabled: false,
        },
      },
    },
    tooltip: {
      shared: true,
    },
    title: {
      text: '',
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
      selected: 2,
    },
    scrollbar: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      title: {
        text: _dc.t('excess_mortality.x_axis'),
      },
      labels: {
        style: {
          color: '#ffffff',
          textOutline: '2px contrast',
        },
        y: 25,
      },
      crosshair: {
        snap: true,
      },
      type: 'datetime',
    },
    yAxis: {
      title: {
        text: _dc.t('excess_mortality.y_axis'),
      },
      labels: {
        x: 10,
        style: {
          color: '#ffffff',
          textOutline: '2px contrast',
        },
      },
      gridLineColor: '#262626',
      opposite: true,
      showFirstLabel: false,
    },

    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'top',
    },

    series: [],
  });
}

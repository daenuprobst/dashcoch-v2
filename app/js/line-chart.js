import {extend} from './helpers.js';
import ChartBase from './chart-base.js';

export default class LineChart extends ChartBase {
  constructor(container, options, updateFunc, updateChartFunc) {
    super();
    this.container = container;
    this.options = extend({
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
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          lineWidth: 1.5,
          marker: {
            enabled: false,
          },
          grouping: false,
        },
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
        selected: 1,
      },
      xAxis: {
        title: {
          text: '',
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
          color: '#999999',
          width: 1,
          dashStyle: 'shortdot',
        },
        type: 'datetime',
      },
      yAxis: {
        title: {
          text: '',
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
        enabled: false,
      },
      tooltip: {shared: true},
      legend: {
        enabled: false,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'top',
      },
      series: [],
    }, options);
    this.updateFunc = updateFunc;
    this.updateChartFunc = updateChartFunc;
  }

  init() {
    this.chart = Highcharts.chart(this.container, this.options);
    return this;
  }
}

import {extend} from './helpers.js';
import ChartBase from './chart-base.js';

export default class BarChart extends ChartBase {
  constructor(container, options, updateFunc, updateChartFunc) {
    super();
    this.container = container;
    this.options = extend({
      chart: {
        type: 'column',
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      xAxis: {
        title: {text: ''},
        type: 'category',
        labels: {
          x: 10,
          style: {
            color: '#ffffff',
            textOutline: '2px contrast',
          },
        },
      },
      yAxis: {
        title: {text: ''},
        opposite: true,
        gridLineColor: '#262626',
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
      tooltip: {shared: true},
      plotOptions: {
        column: {
          borderWidth: 0,
          pointPadding: 0.0,
          color: '#f95d6a',
        },
        bar: {
          borderWidth: 0,
          pointPadding: 0.0,
          color: '#f95d6a',
        },
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

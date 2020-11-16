import turbo from './cm-turbo.js';
import {extend} from './helpers.js';
import ChartBase from './chart-base.js';

export default class Heatmap extends ChartBase {
  constructor(container, options, updateFunc, updateChartFunc) {
    super();
    this.container = container;
    this.options = extend({
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
          turboThreshold: Number.MAX_VALUE, // #3404, remove after 4.0.5 release
        },
      },
      tooltip: {
      },
      xAxis: {
        type: 'datetime',
        labels: {
          style: {
            color: '#ffffff',
            textOutline: '2px contrast',
          },
          y: 25,
        },
      },
      yAxis: {
        type: 'category',
        opposite: true,
        tickWidth: 0,
        reversed: true,
        labels: {
          style: {
            color: '#ffffff',
            textOutline: '2px contrast',
          },
        },
        gridLineColor: '#262626',
      },
      colorAxis: {
        stops: turbo,
      },
      series: [{}],
    }, options);
    this.updateFunc = updateFunc;
    this.updateChartFunc = updateChartFunc;
  }

  init() {
    this.chart = Highcharts.chart(this.container, this.options);
    return this;
  }
}

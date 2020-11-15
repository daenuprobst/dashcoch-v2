import {extend} from './helpers.js';
import ChartBase from './chart-base.js';

export default class ScatterChart extends ChartBase {
  constructor(container, options, updateFunc,
      highlightedCountry = '', labelledCountries = []) {
    super();
    this.container = container;

    this.options = extend({
      chart: {
        type: 'scatter',
        height: 500,
        zoomType: 'xy',
      },
      credits: {
        enabled: false,
      },
      title: {
        text: '',
      },
      xAxis: {
        gridLineWidth: 1,
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
        gridLineColor: '#262626',
      },
      yAxis: {
        labels: {
          x: 10,
          style: {
            color: '#ffffff',
            textOutline: '2px contrast',
          },
        },
        crosshair: {
          snap: true,
          color: '#999999',
          width: 1,
          dashStyle: 'shortdot',
        },
        gridLineColor: '#262626',
        opposite: true,
        showFirstLabel: false,
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            align: 'left',
            verticalAlign: 'middle',
            padding: 10,
            style: {
              color: '#ffffff',
              textOutline: '2px contrast',
            },
            allowOverlap: true,
          },
          marker: {
            radius: 5,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)',
              },
            },
          },
        },
      },
      series: [],
    }, options);

    this.updateFunc = updateFunc;
    this.highlightedCountry = highlightedCountry;
    this.labelledCountries = labelledCountries;
  }

  init() {
    this.chart = Highcharts.chart(this.container, this.options);
    return this;
  }
}

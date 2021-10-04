import {getTargetCoutryDate, getChart, backwardsResample, roundColumn} from './helpers.js';

export default class DailyAdaptiveChart {
  constructor(container, selectionChangedCallback) {
    this.container = container;
    this.selectionChangedCallback = selectionChangedCallback;
    this.selected = null;
  }

  init() {
    const that = this;
    Highcharts.stockChart(this.container, {
      chart: {
        type: 'column',
        zoomType: 'x',
      },
      navigator: {
        enabled: false,
      },
      scrollbar: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          states: {
            select: {
              color: '#2fad94',
            },
          },
          point: {
            events: {
              select: (e) => {
                that.selected = e.target.x;
                that.selectionChangedCallback(that.selected);
              },
              unselect: function(e) {
                if (e.target.x === that.selected) {
                  that.selectionChangedCallback(getTargetCoutryDate());
                }
              },
            },
          },
          dataGrouping: {
            approximation: "average",
          },
        },
        column: {
          borderWidth: 0,
          pointPadding: 0.0,
          color: '#f95d6a',
        },
        area: {
          color: '#f95d6a',
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, '#f95d6aaa'],
              [1, '#f95d6a22'],
            ],
          },
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
          text: _dc.t('daily.x_axis'),
        },
        type: 'datetime',
        crosshair: true,
      },
      yAxis: {
        title: {
          text: 'Cases',
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
      tooltip: {
        shared: true
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

  update(state, data, titleElement) {
    const chart = getChart('daily');
    let suffix = '_diff';
    if (state.daily_total) suffix = '';
    if (state.daily_per_capita) suffix += '_pc';

    titleElement.innerHTML = `${_dc.t(
        'daily.title.' + state.daily_variable_select,
    )} ${_dc.t('cantons.' + state.daily_canton)}`;

    let values = data[state.daily_variable_select][state.daily_canton + suffix]

    chart.series[0].update({
      type: suffix.includes('diff') ? 'column' : 'area',
      name: state.daily_canton,
      data: values,
    });

    if (suffix.includes('diff')) {
      chart.series[1].update({
        type: 'line',
        dashStyle: 'longdash',
        label: '',
        color: '#ffffff',
        marker: { enabled: false },
        name: _dc.t('daily.seven_day_avg') + ' ' + state.daily_canton,
        data: roundColumn(backwardsResample(values.slice(0, -7), 7, 1, false), 3),
      });
    } else {
      chart.series[1].update({
        data: []
      })
    }

    chart.yAxis[0].axisTitle.attr({
      text: _dc.t('daily.y_axis.' + state.daily_variable_select),
    });

    chart.redraw();
  }
}

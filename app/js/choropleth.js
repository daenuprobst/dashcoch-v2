import {getTargetCoutryDate, getChart, getRow} from './helpers.js';
import {cantons} from './cantons.js';

export default class Choropleth {
  constructor(
      container,
      mapReadyCallback,
      selectionChangedCallback,
      geojsonUrl,
  ) {
    this.container = container;
    this.mapReadyCallback = mapReadyCallback;
    this.selectionChangedCallback = selectionChangedCallback;
    this.geojsonUrl = geojsonUrl;
    this.selected = null;
  }

  init() {
    // TODO: This has to go, but seems necessery with highcharts.
    const that = this;

    Highcharts.getJSON(this.geojsonUrl, (geojson) => {
      Highcharts.mapChart(this.container, {
        chart: {
          map: geojson,
        },
        credits: {
          enabled: false,
        },
        title: {
          text: '',
        },
        mapNavigation: {
          enabled: false,
        },
        tooltip: {
          nullFormat: 'No data available',
          formatter: function() {
            // TODO: Get rid of this global state access here
            if (_dc.s.daily_date === getTargetCoutryDate()) {
              return `<b>${this.point.name}</b><br />
                    ${_dc.t('map.today')}: ${this.point.value ? this.point.value : '-'}<br />
                    ${_dc.t('map.yesterday')}: ${this.point.valueYesterday ? this.point.valueYesterday : '-'}<br />
                    ${_dc.t('map.same_day_last_week')}: ${this.point.valueLastWeek ? this.point.valueLastWeek : '-'}<br />`;
            } else {
              return `<b>${this.point.name}</b><br />
                      ${this.point.value ? this.point.value : '-'}`;
            }
          },
        },
        plotOptions: {
          map: {
            nullInteraction: true,
          },
          series: {
            borderWidth: 1,
            borderColor: '#222222',
            nullColor: '#000000',
            keys: ['id', 'value', 'valueYesterday', 'valueLastWeek'],
            joinBy: 'id',
            allowPointSelect: true,
            states: {
              hover: {
                borderColor: '#222222',
              },
              select: {
                color: '#ffa600',
                borderColor: '#ffffff',
              },
            },
            dataLabels: {
              enabled: true,
              useHTML: false,
              // format: '{point.value}',
              formatter: function() {
                return `${this.point.id}: ${this.point.value}`;
              },
              nullFormat: '-',
              allowOverlap: true,
              align: 'center',
              position: 'center',
              style: {
                fontSize: '15px',
                fontWeight: 'bold',
                textOutline: 0,
              },
            },
            point: {
              events: {
                select: (e) => {
                  that.selected = e.target.id;
                  that.selectionChangedCallback(e.target.id);
                },
                unselect: function(e) {
                  if (e.target.id === that.selected) {
                    that.selectionChangedCallback('CH');
                  }
                },
              },
            },
          },
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 700,
              },
              chartOptions: {
                plotOptions: {
                  series: {
                    dataLabels: {
                      style: {fontSize: '11px'},
                    },
                  },
                },
              },
            },
          ],
        },
        colorAxis: {
          visible: true,
          stops: [
            [0, '#003f5c'],
            [1.0, '#f95d6a'],
          ],
          min: 0,
        },
        series: [{}],
      });

      that.mapReadyCallback();
    });
  };

  update(state, data, date_offset) {
    const maxValueForSelector = {
      'cases': 1000,
      'fatalities': 30,
      'hospitalizedTotal': 50,
      'hospitalized': 30,
      'icu': 20,
      'vent': 20,
    };
    const chart = getChart(this.container);
    const rowToday = getRow(
        data[state.daily_variable_select],
        getTargetCoutryDate(0 + date_offset),
    );
    const rowYesterday = getRow(
        data[state.daily_variable_select],
        getTargetCoutryDate(1 + date_offset),
    );
    const rowLastWeek = getRow(
        data[state.daily_variable_select],
        getTargetCoutryDate(7 + date_offset),
    );
    const seriesData = [];
    let suffix = '_diff';
    if (state.daily_total) suffix = '';
    if (state.daily_per_capita) suffix += '_pc';
    for (const canton of cantons) {
      if (canton.id === 'CH') continue;
      const property = canton.id + suffix;
      seriesData.push([
        canton.id,
        rowToday[property],
        rowYesterday[property],
        rowLastWeek[property],
      ]);
    }

    chart.series[0].update({
      name: 'Cases',
      data: seriesData,
    });
    // Fixes the scalebar when we play through
    // the different dates instead of having
    // the color bar be dynamically set.
    if (date_offset > 0) {
      chart.update({
        colorAxis: {
          stops: [
            [0, '#003f5c'],
            [0.5, '#f95d6a'],
            [1.0, '#c80815'],
          ],
          max: maxValueForSelector[state.daily_variable_select],
        }});
    } else {
      chart.update({
        colorAxis: {
          stops: [
            [0, '#003f5c'],
            [1.0, '#f95d6a'],
          ],
          max: null,
        }});
    }
    chart.redraw();
  };
}


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
  }

  update(state, data) {
    const chart = getChart(this.container);
    const rowToday = getRow(
        data[state.daily_variable_select],
        state.daily_date,
    );
    const rowYesterday = getRow(
        data[state.daily_variable_select],
        getTargetCoutryDate(1),
    );
    const rowLastWeek = getRow(
        data[state.daily_variable_select],
        getTargetCoutryDate(7),
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
    chart.redraw();
  };
}

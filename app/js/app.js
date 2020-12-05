import {getData} from './data.js';
import DailyAdaptiveChart from './daily-adaptive-chart.js';
import Choropleth from './choropleth.js';
import {cantons} from './cantons.js';
import {
  getRow, getField, getTargetCoutryDate, backwardsResample,
} from './helpers.js';
import LineChart from './line-chart.js';
import BarChart from './bar-chart.js';
import Heatmap from './heatmap.js';
import initSummary from './summary.js';
import ScatterChart from './scatter-chart.js';
import initRanking from './ranking.js';
import i18n from './i18n.js';
import config from './config.js';

(function(window) {
  'use strict';
  let data = null;

  window._dc = {};
  const persistentState = JSON.parse(localStorage.getItem('state')) ||
                          {language: 'none'};

  _dc.s = {
    language: persistentState.language,
    daily_canton: 'CH',
    daily_date: getTargetCoutryDate(),
    daily_variable_select: 'cases',
    daily_total: false,
    daily_per_capita: false,
    heatmap_variable_select: 'cases',
    heatmap_total: false,
    heatmap_per_capita: true,
    heatmap_age_sex_select: 1,
    heatmap_age_canton_select: 'CH',
    heatmap_age_variable_select: 'cases',
    mobility_variable_select: 'retail_and_recreation',
    cantonal_mobility_variable_select: 'retail_and_recreation',
  };

  function init() {
    getData().then((dfs) => {
      i18n().then(([translator, language]) => {
        _dc.translator = translator;
        _dc.s.language = language;

        data = dfs;
        _dc.data = dfs;

        initLanguages();
        initSummaries();

        _dc.choropleth = new Choropleth(
            'map',
            () => {
              // Geojson for map finished loading
              _dc.choropleth.update(_dc.s, _dc.data);
            },
            (canton) => {
              // Selection changed
              _dc.s.daily_canton = canton;
              _dc.dailyAdaptiveChart.update(_dc.s, _dc.data,
                  document.getElementById('daily-canton-title'));
              _dc.ageSexDistBarChart.update();
              _dc.cantonalComparisonBarChart.update().updateChart();
            },
            '/assets/ch.geojson',
        );
        _dc.choropleth.init();

        _dc.dailyAdaptiveChart = new DailyAdaptiveChart(
            'daily', (date) => {
              _dc.s.daily_date = date;
              _dc.choropleth.update(_dc.s, _dc.data);
            },
        );
        _dc.dailyAdaptiveChart.init();
        _dc.dailyAdaptiveChart.update(_dc.s, _dc.data,
            document.getElementById('daily-canton-title'));

        const ageCategories = [
          '0 – 9', '10 – 19', '20 – 29', '30 – 39',
          '40 – 49', '50 – 59', '60 – 69', '70 – 79', '80+',
        ];

        _dc.ageSexDistBarChart = new BarChart(
            'age-sex-dist',
            {
              chart: {type: 'bar'},
              xAxis: [{
                reversed: false, labels: {step: 1},
                categories: ageCategories,
              }, {
                opposite: true, reversed: false,
                linkedTo: 0, labels: {step: 1},
                categories: ageCategories,
              }],
              yAxis: {
                labels: {enabled: false}, gridLineColor: '#262626',
              },
              tooltip: {
                formatter: function() {
                  return `<b>${this.x}</b><br />
                          ${this.points[0].series.name}: ${Math.abs(this.points[0].point.y)}<br/>
                          ${this.points[1].series.name}: ${Math.abs(this.points[1].point.y)}`;
                },
              },
              rangeSelector: {enabled: false},
            },
            () => {
              document.getElementById(
                  'age-sex-dist-title',
              ).innerHTML = `${_dc.t('age_sex_dist.title.' +
                _dc.s.daily_variable_select)} ${_dc.t('cantons.' +
                _dc.s.daily_canton)}`;

              if (!['cases', 'fatalities'].includes(
                  _dc.s.daily_variable_select,
              )) {
                return [{id: 'male', data: []}, {id: 'female', data: []}];
              }

              const maleData = Object.keys(
                  data.ageSexDist[_dc.s.daily_canton][1],
              ).map((key) => {
                return data.ageSexDist[_dc.s.daily_canton][1][key][
                    _dc.s.daily_variable_select
                ];
              });

              const femaleData = Object.keys(
                  data.ageSexDist[_dc.s.daily_canton][1],
              ).map((key) => {
                return data.ageSexDist[_dc.s.daily_canton][2][key][
                    _dc.s.daily_variable_select
                ];
              });

              return [
                {
                  id: 'male',
                  name: _dc.t('age_sex_dist.male'),
                  data: maleData.map((item) => -item),
                  color: '#665191',
                  stacking: 'normal',
                },
                {
                  id: 'female',
                  name: _dc.t('age_sex_dist.female'),
                  data: femaleData,
                  color: '#ff7c43',
                  stacking: 'normal',
                },
              ];
            },
        ).init().update();

        _dc.cantonalComparisonBarChart = new BarChart(
            'canton-comparison',
            {
              tooltip: {
                nullFormat: 'No data available',
                formatter: function() {
                  return `<b>${_dc.t('cantons.' + this.points[0].key)}</b><br />
                          ${Math.round(100 * this.points[0].y) / 100}`;
                },
              },
              rangeSelector: {enabled: false},
            }, () => {
              const rowToday = getRow(
                  data[_dc.s.daily_variable_select],
                  getTargetCoutryDate(),
              );
              const seriesData = [];
              const seriesColor = [];

              for (const canton of cantons) {
                seriesData.push([canton.id, rowToday[canton.id + '_pc']]);
                if (canton.id === _dc.s.daily_canton) {
                  seriesColor.push('#2fad94');
                } else {
                  seriesColor.push('#f95d6a');
                }
              }

              return [{
                id: 'comparison',
                name: '',
                data: seriesData,
                colorByPoint: true,
                colors: seriesColor,
              }];
            }, () => {
              return {
                yAxis: {title: {text: _dc.t('canton_comparison.y_axis.' +
                  _dc.s.daily_variable_select),
                }},
              };
            },
        ).init().update().updateChart();

        _dc.testPositivityRateLineChart = new LineChart(
            'test-positivity-rate',
            {
              xAxis: {title: _dc.t('test_positivity_rate.x_axis')},
              yAxis: {title: _dc.t('test_positivity_rate.y_axis')},
              tooltip: {
                formatter: function() {
                  return `${Math.round(100 * this.y) / 100}%`;
                },
              },
            },
            () => {
              return [{
                id: 'positivityRate',
                name: '',
                color: '#f95d6a',
                data: data.testPositivityRate['frac_negative'],
              }];
            },
        ).init().update();

        _dc.numberOfTestsBarChart = new BarChart(
            'number-of-tests',
            {
              xAxis: {title: {text: _dc.t('number_of_tests.x_axis')},
                type: 'datetime'},
              yAxis: {title: {text: _dc.t('number_of_tests.y_axis')}},
            },
            () => {
              return [
                {
                  id: 'negTests',
                  name: _dc.t('number_of_tests.number_of_negative_tests'),
                  data: data.testPositivityRate['n_negative'],
                  stacking: 'normal',
                  color: '#003f5c',
                }, {
                  id: 'posTests',
                  name: _dc.t('number_of_tests.number_of_positive_tests'),
                  data: data.testPositivityRate['n_positive'],
                  stacking: 'normal',
                  color: '#f95d6a',
                },
              ];
            },
        ).init().update();

        _dc.cantonsHeatmap = new Heatmap(
            'heatmap',
            {
              xAxis: {title: {text: _dc.t('heatmap.x_axis')}, type: 'datetime'},
              yAxis: {
                categories: cantons.filter(
                    (e) => e.id !== 'CH',
                ).map((e) => e.id),
                labels: { style: {fontSize: '9px'}}
              },
              tooltip: {
                formatter: function() {
                  return `<b>${_dc.t('cantons.' + this.series.yAxis.categories[this.point.y])}</b><br />
                          ${moment(this.point.x).format('LL')}<br />
                          ${Math.round(this.point.value * 100) / 100}`;
                },
              },
            },
            () => {
              // This is a bit hacky, as there is currently no way to use nice
              // diverging color scales in Highcharts heatmaps... Weird.
              const v = _dc.s.heatmap_variable_select;
              if (v.includes('hosp') || v.includes('icu') ||
                  v.includes('vent')) {
                _dc.s.heatmap_total = true;
                document.getElementById('heatmap-total-toggle').checked = true;
              }

              let suffix = '_diff';
              if (_dc.s.heatmap_total) suffix = '';
              if (_dc.s.heatmap_per_capita) suffix += '_pc';

              let seriesData = [];
              let i = 0;
              for (const canton of cantons) {
                if (canton.id === 'CH') continue;
                seriesData = seriesData.concat(
                    data[_dc.s.heatmap_variable_select][
                        canton.id + suffix
                    ].map((v) => [v[0], i, v[1]]),
                );
                i++;
              }

              return [{
                id: 'cantonsHeatmap',
                data: seriesData,
                colsize: 24 * 36e5,
              }];
            },
        ).init().update();

        _dc.ageHeatmap = new Heatmap(
            'heatmap-age',
            {
              chart: {height: 450},
              xAxis: {title: {text: _dc.t('heatmap_age.x_axis')},
                type: 'linear'},
              yAxis: {title: {text: _dc.t('heatmap_age.y_axis')},
                categories: Object.keys(data.ageSexDist.CH[1]),
                reversed: false},
              rangeSelector: {enabled: false},
              tooltip: {
                formatter: function() {
                  return `<b>${this.series.yAxis.categories[this.point.y]}</b><br />
                          ${_dc.t('heatmap_age.week')} ${this.point.x}<br />
                          ${this.point.value}`;
                },
              },
            },
            () => {
              const seriesData = [];
              let i = 0;
              for (const ageRange of Object.values(
                  data.ageSexDateDist[_dc.s.heatmap_age_canton_select][
                      _dc.s.heatmap_age_sex_select
                  ],
              )) {
                for (const [keyDate, valueDate] of Object.entries(ageRange)) {
                  seriesData.push([
                    parseFloat(keyDate), i,
                    valueDate[_dc.s.heatmap_age_variable_select],
                  ]);
                }
                i++;
              }

              return [{
                id: 'ageHeatmap',
                data: seriesData,
              }];
            },
        ).init().update();

        _dc.testingScatter = new ScatterChart(
            'number-positivity-tests',
            {
              xAxis: {title: {text: _dc.t('number_positivity_tests.x_axis')}},
              yAxis: {title: {text: _dc.t('number_positivity_tests.y_axis')}},
              tooltip: {
                formatter: function() {
                  return `<b>${this.point.country}</b><br />
                  Tests per 100 000: <b>${Math.round(this.point.x * 100) / 100}</b><br />
                  Test positivity: <b>${Math.round(this.point.y * 100) / 100}%</b>`;
                },
              },
              plotOptions: {scatter: {dataLabels: {
                formatter: function() {
                  return `${config.number_positivity_tests.labelled_countries.includes(this.point.country) ? this.point.country : ''}`;
                },
              }}},
            },
            (chart) => {
              const x = 'new_tests_smoothed_per_thousand';
              const y = 'positivity_rate';
              const seriesData = [];
              for (const [country, dates] of Object.entries(data.testing)) {
                // Get the max date
                const sortedDateKeys = Object.keys(dates).sort((a, b) => {
                  return parseInt(b) - parseInt(a);
                });

                let yTmp = 0;
                let nY = 0;

                for (const key of sortedDateKeys) {
                  if (key && key !== undefined) {
                    yTmp += dates[key][y];
                    nY++;
                  }
                }

                yTmp /= nY;

                const xVal = 1000 * dates[sortedDateKeys[0]][x];
                const yVal = 100 * yTmp;

                if (xVal <= 0 || yVal <= 0 ||
                    dates[sortedDateKeys[0]]['population'] < 5000000) {
                  continue;
                }

                seriesData.push({
                  date: new Date(parseInt(sortedDateKeys[0])),
                  country: country,
                  x: xVal, y: yVal,
                  color: config.number_positivity_tests.highlighted_countries
                      .includes(country) ? '#f95d6a' : '#003f5c',
                });
              }

              return [{
                id: 'data',
                data: seriesData,
              }];
            },
        ).init().update();
        // TODO: That's a bit hacky, should be a nice method
        // (maybe outlier-detection)
        _dc.testingScatter.chart.xAxis[0].setExtremes(0, 6000);
        _dc.testingScatter.chart.showResetZoom();

        _dc.testingScatter = new ScatterChart(
            'gdp-stringency',
            {
              chart: {type: 'bubble'},
              xAxis: {title: {text: _dc.t('gdp_stringency.x_axis')}},
              yAxis: {title: {text: _dc.t('gdp_stringency.y_axis')}},
              tooltip: {
                formatter: function() {
                  return `<b>${this.point.country}</b><br />
                  ${_dc.t('gdp_stringency.x_axis')}: <b>${Math.round(this.point.x * 100) / 100}</b><br />
                  ${_dc.t('gdp_stringency.y_axis')}: <b>${Math.round(this.point.y * 100) / 100} / 100</b><br />
                  ${_dc.t('gdp_stringency.z_axis')}: <b>${Math.round(this.point.z * 100) / 100}</b>`;
                },
              },
              plotOptions: {series: {dataLabels: {
                align: 'center',
                formatter: function() {
                  return `${config.number_positivity_tests.labelled_countries.includes(this.point.country) ? this.point.country : ''}`;
                },
              }}},
            },
            () => {
              const x = 'gdp_per_capita';
              const y = 'stringency_index';
              const z = 'new_cases_smoothed_per_million';

              const seriesData = [];
              for (const [country, dates] of Object.entries(data.testing)) {
                // Get the max date
                const sortedDateKeys = Object.keys(dates).sort((a, b) => {
                  return parseInt(b) - parseInt(a);
                });

                let yLatest = 0;

                for (const key of sortedDateKeys) {
                  if (key && key !== undefined && dates[key][y] > 0) {
                    yLatest = dates[key][y];
                    break;
                  }
                }

                const xVal = dates[sortedDateKeys[0]][x];
                const yVal = yLatest;
                const zVal = dates[sortedDateKeys[0]][z];

                if (xVal <= 0 || yVal <= 0 ||
                    dates[sortedDateKeys[0]]['population'] < 5000000) {
                  continue;
                }

                seriesData.push({
                  date: new Date(parseInt(sortedDateKeys[0])),
                  country: country,
                  x: xVal, y: yVal, z: zVal,
                  color: config.number_positivity_tests.highlighted_countries
                      .includes(country) ? '#f95d6a' : '#003f5c',
                });
              }

              return [{
                id: 'data',
                data: seriesData,
              }];
            }).init().update();

        _dc.mobilityLineChart = new LineChart(
            'mobility',
            {
              rangeSelector: {selected: 2}, legend: {enabled: true},
              xAxis: {title: {text: _dc.t('mobility.x_axis')}},
              yAxis: {title: {text: _dc.t('mobility.y_axis')}},
            },
            () => {
              return Object.keys(data.mobility).map((country) => {
                return {
                  id: country,
                  name: _dc.t('countries.' + country),
                  data: Object.keys(data.mobility[country]).map((date) => {
                    return [
                      parseInt(date),
                      Math.round(
                          (100 * data.mobility[country][date][
                              _dc.s.mobility_variable_select
                          ]) / 100,
                      ),
                    ];
                  }),
                  color: config.countries.colors[country],
                };
              });
            },
        ).init().update();

        _dc.excessMortalityLineChart = new LineChart(
            'excess-mortality',
            {rangeSelector: {selected: 2}, legend: {enabled: true},
              xAxis: {title: {text: _dc.t('excess_mortality.x_axis')}},
              yAxis: {title: {text: _dc.t('excess_mortality.y_axis')}},
            },
            () => {
              return config.countries.excess_mortality.map((country) => {
                let max_date = moment().subtract(4 * 7, 'days');
                return {
                  id: country,
                  name: _dc.t('countries.' + country),
                  data: Object.keys(data.excessMortality[country])
                      .map((date) => {
                        let date_int = parseInt(date)
                        if (moment(date_int).isSameOrBefore(max_date)) {
                          return [
                            date_int,
                            data.excessMortality[country][date][
                                'p_scores_all_ages'
                            ],
                          ];
                        }
                      }),
                  color: config.countries.colors[country],
                };
              });
            },
        ).init().update();

        initRanking('cases_per_million_ranking',
            data.owid, 'new_cases_smoothed_per_million',
            false,
        );

        initRanking('fatalities_per_million_ranking',
            data.owid, 'new_deaths_smoothed_per_million',
            false,
        );

        _dc.translator.translatePageTo(_dc.s.language);
        document.getElementById('loader').classList.add('d-none');
      });
    });
  }

  _dc.t = function(key) {
    return _dc.translator.translateForKey(key, _dc.s.language);
  };

  // Select the daily variable
  document
      .getElementById('daily-variable-select')
      .addEventListener('change', (event) => {
        _dc.s.daily_variable_select = event.target.value;
        _dc.dailyAdaptiveChart.update(_dc.s, _dc.data,
            document.getElementById('daily-canton-title'));
        _dc.choropleth.update(_dc.s, _dc.data);
        _dc.ageSexDistBarChart.update();
        _dc.cantonalComparisonBarChart.update().updateChart();
      });
  document
      .getElementById('daily-total-toggle')
      .addEventListener('change', (event) => {
        _dc.s.daily_total = event.target.checked;
        _dc.dailyAdaptiveChart.update(_dc.s, _dc.data,
            document.getElementById('daily-canton-title'));
        _dc.choropleth.update(_dc.s, _dc.data);
        _dc.cantonalComparisonBarChart.update().updateChart();
      });
  document
      .getElementById('daily-per-capita-toggle')
      .addEventListener('change', (event) => {
        _dc.s.daily_per_capita = event.target.checked;
        _dc.dailyAdaptiveChart.update(_dc.s, _dc.data,
            document.getElementById('daily-canton-title'));
        _dc.choropleth.update(_dc.s, _dc.data);
        _dc.cantonalComparisonBarChart.update().updateChart();
      });

  // Select the heatmap variable
  document
      .getElementById('heatmap-variable-select')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_variable_select = event.target.value;
        _dc.cantonsHeatmap.update();
      });
  document
      .getElementById('heatmap-total-toggle')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_total = event.target.checked;
        _dc.cantonsHeatmap.update();
      });
  document
      .getElementById('heatmap-per-capita-toggle')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_per_capita = event.target.checked;
        _dc.cantonsHeatmap.update();
      });

  // Heatmap age sex
  document
      .getElementById('heatmap-age-sex-select')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_age_sex_select = event.target.value;
        _dc.ageHeatmap.update();
      });

  const heatmapCantonSelect = document.getElementById(
      'heatmap-age-canton-select',
  );
  for (const canton of cantons) {
    heatmapCantonSelect.appendChild(
        element('option', {value: canton.id}, canton.name),
    );
  }
  heatmapCantonSelect.addEventListener('change', (event) => {
    _dc.s.heatmap_age_canton_select = event.target.value;
    _dc.ageHeatmap.update();
  });

  document
      .getElementById('heatmap-age-variable-select')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_age_variable_select = event.target.value;
        _dc.ageHeatmap.update();
      });

  // Mobility
  document
      .getElementById('mobility-variable-select')
      .addEventListener('change', (event) => {
        _dc.s.mobility_variable_select = event.target.value;
        _dc.mobilityLineChart.update();
      });

  function initSummaries() {
    initSummary(
        'summary-today',
        'Today',
        'summary.today',
        getField(data.cases, getTargetCoutryDate(), 'CH_diff'),
        getField(data.fatalities, getTargetCoutryDate(), 'CH_diff'),
        getField(data.hospitalizedTotal, getTargetCoutryDate(), 'CH_diff'),
        getReportingRegions(),
        26,
    );

    initSummary(
        'summary-yesterday',
        'Yesterday',
        'summary.yesterday',
        getField(data.cases, getTargetCoutryDate(1), 'CH_diff'),
        getField(data.fatalities, getTargetCoutryDate(1), 'CH_diff'),
        getField(data.hospitalizedTotal, getTargetCoutryDate(1), 'CH_diff'),
        getReportingRegions(1),
        26,
    );

    const weeklyCases = backwardsResample(data.cases.CH_diff, 7, 7, 2);
    const weeklyFatalities = backwardsResample(data.fatalities.CH_diff, 7, 7, 2);
    const weeklyHospitalizations = backwardsResample(
        data.hospitalizedTotal.CH_diff,
        7,
        7,
        2,
    );

    initSummary(
        'summary-week',
        'Last 7 Days (Average)',
        'summary.last_7_days_avarage',
        weeklyCases[1][1],
        weeklyFatalities[1][1],
        weeklyHospitalizations[1][1],
    );

    initSummary(
        'summary-previous-week',
        'Previous 7 Days (Average)',
        'summary.previous_7_days_avarage',
        weeklyCases[0][1],
        weeklyFatalities[0][1],
        weeklyHospitalizations[0][1],
    );
  }

  function getReportingRegions(daysAgo = 0) {
    // Assuming that cantons that report cases report all other variables
    // same time as well
    const row = getRow(data.cases, getTargetCoutryDate(daysAgo));
    const reported = [];

    for (const [key, value] of Object.entries(row)) {
      if (
        key.endsWith('_diff') &&
                value !== null &&
                key.slice(0, 2) !== 'CH'
      ) {
        reported.push(key.slice(0, 2));
      }
    }

    return reported;
  }

  function initLanguages() {
    const container = document.getElementById('languages');
    for (const language of config.availableLanguages) {
      container.appendChild(element('a', {
        href: '#',
        class: 'dropdown-item',
        click: (e) => {
          e.preventDefault();
          _dc.s.language = language;
          saveState();
          location.reload();
          return false;
        },
      }, language));
    }
  }

  function saveState() {
    localStorage.setItem('state', JSON.stringify({language: _dc.s.language}));
  }

  init();
})(window);

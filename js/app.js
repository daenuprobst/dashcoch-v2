import {getData} from './data.js';
import initDaily from './daily.js';
import initMap from './map.js';
import {cantons} from './cantons.js';
import {
  getRow,
  getField,
  getChart,
  getTargetCoutryDate,
  backwardsResample,
} from './helpers.js';
import initTestPositivityRate from './test-positivity-rate.js';
import initNumberOfTests from './number-of-tests.js';
import initAgeSexDist from './age-sex-dist.js';
import initCantonComparison from './canton-comparison.js';
import initHeatmap from './heatmap.js';
import initHeatmapAge from './heatmap-age.js';
import initMobility from './mobility.js';
import initExcessMortality from './excess-mortality.js';
import initSummary from './summary.js';
import i18n from './i18n.js';
import config from './config.js';

(function(window) {
  'use strict';
  let data = null;

  window._dc = {};
  _dc.s = JSON.parse(localStorage.getItem('state')) || {
    language: '',
    daily_canton: 'CH',
    daily_variable_select: 'cases',
    daily_total: false,
    daily_per_capita: false,
    heatmap_variable_select: 'cases',
    heatmap_total: false,
    heatmap_per_capita: true,
    heatmap_age_sex_select: 1,
    heatmap_age_canton_select: 'CH',
    heatmap_age_variable_select: 'cases',
    mobility_variable_select: 'retail_recreation',
    comparing_countries: [
      'Switzerland',
      'Sweden',
      'Germany',
      'United States',
      'Norway',
    ],
    comparing_countries_colors: {
      'Switzerland': '#ffa600',
      'Sweden': '#ff6361',
      'Germany': '#bc5090',
      'United States': '#58508d',
      'Norway': '#003f5c',
    },
  };

  function init() {
    getData().then((dfs) => {
      i18n().then(([translator, language]) => {
        _dc.translator = translator;
        _dc.s.language = language;

        data = dfs;

        initLanguages();
        initSummaries();

        initDaily('daily');
        _dc.updateDaily();

        initMap(
            'map',
            () => {
              // Geojson for map finished loading
              _dc.updateMap();
            },
            (canton) => {
              // Selection changed
              _dc.s.daily_canton = canton;
              _dc.updateDaily();
              _dc.updateAgeSexDist();
              _dc.updateCantonComparison();
            },
        );

        initTestPositivityRate('test-positivity-rate');
        _dc.updateTestPositivityRate();

        initNumberOfTests('number-of-tests');
        _dc.updateNumberOfTests();

        initAgeSexDist('age-sex-dist');
        _dc.updateAgeSexDist();

        initCantonComparison(
            'canton-comparison',
            cantons.map((canton) => canton.id),
        );
        _dc.updateCantonComparison();

        initHeatmap(
            'heatmap',
            cantons.filter((e) => e.id !== 'CH').map((e) => e.id),
        );
        _dc.updateHeatmap();

        initHeatmapAge(
            'heatmap-age',
            Object.keys(data.ageSexDist.CH[1]),
        );
        _dc.updateHeatmapAge();

        initMobility('mobility');
        _dc.updateMobility();

        initExcessMortality('excess-mortality');
        _dc.updateExcessMortality();

        _dc.translator.translatePageTo(_dc.s.language);
      });
    });
  }

  _dc.updateAgeSexDist = function() {
    const chart = getChart('age-sex-dist');
    const title = document.getElementById('age-sex-dist-title');

    title.innerHTML = `${_dc.t(
        'age_sex_dist.title.' + _dc.s.daily_variable_select,
    )} ${_dc.t('cantons.' + _dc.s.daily_canton)}`;

    if (!['cases', 'fatalities'].includes(_dc.s.daily_variable_select)) {
      chart.series[0].update({data: []});
      chart.series[1].update({data: []});
      return;
    }

    const maleData = Object.keys(data.ageSexDist[_dc.s.daily_canton][1]).map(
        (key) => {
          return data.ageSexDist[_dc.s.daily_canton][1][key][
              _dc.s.daily_variable_select
          ];
        },
    );

    const femaleData = Object.keys(
        data.ageSexDist[_dc.s.daily_canton][1],
    ).map((key) => {
      return data.ageSexDist[_dc.s.daily_canton][2][key][
          _dc.s.daily_variable_select
      ];
    });

    chart.series[0].update({
      name: _dc.t('age_sex_dist.male'),
      data: maleData.map((item) => -item),
    });
    chart.series[1].update({
      name: _dc.t('age_sex_dist.female'),
      data: femaleData,
    });
  };

  _dc.updateTestPositivityRate = function() {
    const chart = getChart('test-positivity-rate');
    chart.series[0].update({
      name: '',
      data: data.testPositivityRate['frac_negative'],
    });
  };

  _dc.updateNumberOfTests = function() {
    const chart = getChart('number-of-tests');
    chart.series[0].update({
      name: _dc.t('number_of_tests.number_of_negative_tests'),
      data: data.testPositivityRate['n_negative'],
    });
    chart.series[1].update({
      name: _dc.t('number_of_tests.number_of_positive_tests'),
      data: data.testPositivityRate['n_positive'],
    });
  };

  _dc.updateCantonComparison = function() {
    const chart = getChart('canton-comparison');
    const rowToday = getRow(
        data[_dc.s.daily_variable_select],
        getTargetCoutryDate(),
    );
    const seriesData = [];
    const seriesColor = [];

    for (const canton of cantons) {
      seriesData.push(rowToday[canton.id + '_pc']);
      if (canton.id === _dc.s.daily_canton) {
        seriesColor.push('#2fad94');
      } else {
        seriesColor.push('#f95d6a');
      }
    }

    chart.series[0].update({
      name: 'Cases',
      data: seriesData,
      colorByPoint: true,
      colors: seriesColor,
    });

    chart.yAxis[0].axisTitle.attr({
      text: _dc.t(
          'canton_comparison.y_axis.' + _dc.s.daily_variable_select,
      ),
    });
  };

  _dc.updateDaily = function() {
    const title = document.getElementById('daily-canton-title');
    const chart = getChart('daily');
    const suffix = getDailySuffix();

    title.innerHTML = `${_dc.t(
        'daily.title.' + _dc.s.daily_variable_select,
    )} ${_dc.t('cantons.' + _dc.s.daily_canton)}`;

    chart.series[0].update({
      type: suffix.includes('diff') ? 'column' : 'area',
      name: _dc.s.daily_canton,
      data:
                data[_dc.s.daily_variable_select][_dc.s.daily_canton + suffix],
    });

    chart.yAxis[0].axisTitle.attr({
      text: _dc.t('daily.y_axis.' + _dc.s.daily_variable_select),
    });

    chart.redraw();
  };

  _dc.updateMap = function() {
    const chart = getChart('map');
    const rowToday = getRow(
        data[_dc.s.daily_variable_select],
        getTargetCoutryDate(),
    );
    const rowYesterday = getRow(
        data[_dc.s.daily_variable_select],
        getTargetCoutryDate(1),
    );
    const rowLastWeek = getRow(
        data[_dc.s.daily_variable_select],
        getTargetCoutryDate(7),
    );
    const seriesData = [];
    const suffix = getDailySuffix();

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

  _dc.updateHeatmap = function() {
    // This is a bit hacky, as there is currently no way to use nice
    // diverging color scales in Highcharts heatmaps... Weird.
    const tmp = _dc.s.heatmap_variable_select;
    if (
      tmp.includes('hosp') ||
            tmp.includes('icu') ||
            tmp.includes('vent')
    ) {
      _dc.s.heatmap_total = true;
      document.getElementById('heatmap-total-toggle').checked = true;
    }

    const chart = getChart('heatmap');
    let seriesData = [];
    const suffix = getHeatmapSuffix();

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
    chart.series[0].update({
      name: 'Cases',
      data: seriesData,
    });
    chart.redraw();
  };

  _dc.updateHeatmapAge = function() {
    const chart = getChart('heatmap-age');
    const seriesData = [];
    let i = 0;

    for (const [, valueAge] of Object.entries(
        data.ageSexDateDist[_dc.s.heatmap_age_canton_select][
            _dc.s.heatmap_age_sex_select
        ],
    )) {
      for (const [keyDate, valueDate] of Object.entries(valueAge)) {
        seriesData.push([
          parseFloat(keyDate),
          i,
          valueDate[_dc.s.heatmap_age_variable_select],
        ]);
      }
      i++;
    }

    chart.series[0].update({
      name: 'Cases',
      data: seriesData,
    });
    chart.redraw();
  };

  _dc.updateMobility = function() {
    const chart = getChart('mobility');

    // Initialize series on first update
    if (chart.series.length === 0) {
      for (const [country] of Object.entries(data.mobility)) {
        chart.addSeries({
          id: country,
          name: country,
          data: [],
          color: _dc.s.comparing_countries_colors[country],
        });
      }
    }

    for (const [country] of Object.entries(data.mobility)) {
      const seriesData = [];
      for (const [date] of Object.entries(data.mobility[country])) {
        seriesData.push([
          parseInt(date),
          Math.round(
              (100 * data.mobility[country][date][
                  _dc.s.mobility_variable_select
              ]) / 100,
          ),
        ]);
      }

      chart.get(country).update({data: seriesData});
    }
  };

  _dc.updateExcessMortality = function() {
    const chart = getChart('excess-mortality');

    // Initialize series on first update
    if (chart.series.length === 0) {
      for (const country in data.excessMortality) {
        if (!_dc.s.comparing_countries.includes(country)) continue;
        chart.addSeries({
          id: country,
          name: country,
          data: [],
          color: _dc.s.comparing_countries_colors[country],
        });
      }
    }

    for (const country in data.excessMortality) {
      if (!_dc.s.comparing_countries.includes(country)) continue;

      const seriesData = [];
      for (const [date] of Object.entries(data.excessMortality[country])) {
        seriesData.push([
          parseInt(date),
          data.excessMortality[country][date]['p_scores_all_ages'],
        ]);
      }

      chart.get(country).update({data: seriesData});
    }
  };

  _dc.t = function(key) {
    return _dc.translator.translateForKey(key, _dc.s.language);
  };

  // Select the daily variable
  document
      .getElementById('daily-variable-select')
      .addEventListener('change', (event) => {
        _dc.s.daily_variable_select = event.target.value;
        _dc.updateDaily();
        _dc.updateMap();
        _dc.updateAgeSexDist();
        _dc.updateCantonComparison();
      });
  document
      .getElementById('daily-total-toggle')
      .addEventListener('change', (event) => {
        _dc.s.daily_total = event.target.checked;
        _dc.updateDaily();
        _dc.updateMap();
        _dc.updateCantonComparison();
      });
  document
      .getElementById('daily-per-capita-toggle')
      .addEventListener('change', (event) => {
        _dc.s.daily_per_capita = event.target.checked;
        _dc.updateDaily();
        _dc.updateMap();
        _dc.updateCantonComparison();
      });

  // Select the heatmap variable
  document
      .getElementById('heatmap-variable-select')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_variable_select = event.target.value;
        _dc.updateHeatmap();
      });
  document
      .getElementById('heatmap-total-toggle')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_total = event.target.checked;
        _dc.updateHeatmap();
      });
  document
      .getElementById('heatmap-per-capita-toggle')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_per_capita = event.target.checked;
        _dc.updateHeatmap();
      });

  // Heatmap age sex
  document
      .getElementById('heatmap-age-sex-select')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_age_sex_select = event.target.value;
        _dc.updateHeatmapAge();
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
    _dc.updateHeatmapAge();
  });

  document
      .getElementById('heatmap-age-variable-select')
      .addEventListener('change', (event) => {
        _dc.s.heatmap_age_variable_select = event.target.value;
        _dc.updateHeatmapAge();
      });

  // Mobility
  document
      .getElementById('mobility-variable-select')
      .addEventListener('change', (event) => {
        _dc.s.mobility_variable_select = event.target.value;
        _dc.updateMobility();
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

    const weeklyCases = backwardsResample(data.cases.CH_diff, 7, 2);
    const weeklyFatalities = backwardsResample(data.fatalities.CH_diff, 7, 2);
    const weeklyHospitalizations = backwardsResample(
        data.hospitalizedTotal.CH_diff,
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

  function getDailySuffix() {
    let suffix = '_diff';
    if (_dc.s.daily_total) suffix = '';
    if (_dc.s.daily_per_capita) suffix += '_pc';
    return suffix;
  }

  function getHeatmapSuffix() {
    let suffix = '_diff';
    if (_dc.s.heatmap_total) suffix = '';
    if (_dc.s.heatmap_per_capita) suffix += '_pc';
    return suffix;
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
    localStorage.setItem('state', JSON.stringify(_dc.s));
  }

  init();
})(window);

export default function initMap(
    container,
    mapReadyCallback,
    selectionChangedCallback,
) {
  const url = '/assets/ch.geojson';

  // This is an ugly hack because highcharts fires the select event
  // before the unselect event, so we have to keep track of the currently
  // selected value, to see whether a new one was selected or the current
  // one just deselected.
  let selected = null;

  Highcharts.getJSON(url, function(geojson) {
    Highcharts.mapChart(container, {
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
          return `<b>${this.point.name}</b><br />
                  ${_dc.t('map.today')}: ${this.point.value ? this.point.value : '-'}<br />
                  ${_dc.t('map.yesterday')}: ${this.point.valueYesterday ? this.point.valueYesterday : '-'}<br />
                  ${_dc.t('map.same_day_last_week')}: ${this.point.valueLastWeek ? this.point.valueLastWeek : '-'}<br />`;
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
            format: '{point.value}',
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
                selected = e.target.id;
                selectionChangedCallback(e.target.id);
              },
              unselect: function(e) {
                if (e.target.id === selected) {
                  selectionChangedCallback('CH');
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

    mapReadyCallback();
  });
}

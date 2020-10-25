import { cantons } from './cantons.js'
import { getRow } from './helpers.js'

function initMap(df, container, seriesCallback) {
    let url = '/assets/ch.geojson';

    Highcharts.getJSON(url, function (geojson) {
        Highcharts.mapChart(container, {
            chart: {
                map: geojson,
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            mapNavigation: {
                enabled: false,
            },
            tooltip: {
                nullFormat: 'No data available',
                formatter: function () {
                    return '<b>' + this.point.name + '</b><br>' +
                        'Today: ' + (this.point.value ? this.point.value : '-') + '<br />' +
                        'Yesterday: ' + (this.point.valueYesterday ? this.point.valueYesterday : '-');
                }
            },
            plotOptions: {
                map: {
                    nullInteraction: true,
                },
                series: {
                    borderWidth: 1,
                    borderColor: '#222222',
                    nullColor: '#000000',
                    keys: ['id', 'value', 'valueYesterday'],
                    joinBy: 'id',
                    states: {
                        hover: {
                            borderColor: '#222222',
                        }
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
                        }
                    },
                    point: {
                        events: {
                            click: function () {
                                dashcoch.state.daily_canton = this.id;
                                dashcoch.updateDaily();
                            }
                        }
                    }
                },
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 700
                    },
                    chartOptions: {
                        plotOptions: {
                            series: {
                                dataLabels: {
                                    style: { fontSize: '11px', }
                                }
                            },
                        },
                    }
                }]
            },
            colorAxis: {
                visible: true,
                stops: [
                    [0, '#2D384D'],
                    [1.0, '#DB4453']
                ],
                min: 0,
            },
            series: seriesCallback(df)
        });
    });
}

export { initMap }
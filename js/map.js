function initMap(df, container, seriesCallback) {
    let url = '/assets/ch.geojson';

    Highcharts.getJSON(url, function (geojson) {
        Highcharts.mapChart(container, {
            chart: {
                map: geojson,
                // spacing: [10, 10, 10, 10],
                height: '65%'
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
            plotOptions: {
                series: {
                    borderWidth: 0,
                    keys: ['id', 'value'],
                    joinBy: 'id',
                    states: {
                        hover: {
                            borderColor: '#222222',
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.value}',
                        allowOverlap: true,
                        style: {
                            fontSize: '15px',
                            fontWeight: 'bold',
                            textOutline: 0,
                        }
                    },
                    point: {
                        events: {
                            click: function () {
                                console.log(this.name);
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
                visible: false,
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
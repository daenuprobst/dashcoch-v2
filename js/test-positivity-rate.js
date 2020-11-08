export default function initTestPositivityRate(container) {
    Highcharts.stockChart(container, {
        chart: {
            animation: false,
            zoomType: "x",
            // spacing: [0, 0, 0, 0],
            events: {
                load: function () {},
            },
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
                color: "#f95d6a",
                grouping: false,
            },
        },
        boost: {
            enabled: true,
        },
        title: {
            text: "",
        },
        xAxis: {
            title: {
                text: _dc.t("test_positivity_rate.x_axis"),
            },
            type: "datetime",
        },
        yAxis: {
            title: {
                text: _dc.t("test_positivity_rate.y_axis"),
            },
            labels: {
                style: {
                    color: "#ffffff",
                    textOutline: "2px contrast",
                },
            },
            showFirstLabel: false,
            gridLineColor: "#262626",
        },
        legend: {
            enabled: false,
        },
        rangeSelector: {
            buttons: [
                {
                    type: "month",
                    count: 1,
                    text: "1m",
                },
                {
                    type: "month",
                    count: 3,
                    text: "3m",
                },
                {
                    type: "all",
                    text: "All",
                },
            ],
            inputEnabled: false,
            selected: 0,
        },
        tooltip: {
            formatter: function () {
                return `${Math.round(100 * this.y) / 100}%`;
            },
        },
        series: [{}],
    });
}

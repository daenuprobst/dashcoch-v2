export default class ChartBase {
  constructor() {}

  update() {
    const series = this.updateFunc(this.chart);

    // Initialize series on first update
    for (const s of series) {
      if (this.chart.get(s.id) === undefined) {
        this.chart.addSeries(s);
      } else {
        this.chart.get(s.id).update(s);
      }
    }

    return this;
  }

  updateChart(options = null) {
    if (this.updateChartFunc) {
      this.chart.update(this.updateChartFunc());
    }
    if (options) {
      this.chart.update(options);
    }
    return this;
  }
}

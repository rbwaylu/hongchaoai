<template>
  <div>
    <h1>数据看板</h1>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import { Line } from 'chart.js';
import axios from 'axios';

export default {
  data() {
    return {
      kpiData: []
    };
  },
  async created() {
    const response = await axios.get("/api/kpis");
    this.kpiData = response.data.kpis;
    this.renderChart();
  },
  methods: {
    renderChart() {
      const ctx = this.$refs.chart.getContext('2d');
      new Line(ctx, {
        data: {
          labels: this.kpiData.map(kpi => kpi.timestamp),
          datasets: [{
            label: '用户活跃度',
            data: this.kpiData.map(kpi => kpi.value),
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false
          }]
        }
      });
    }
  }
};
</script>
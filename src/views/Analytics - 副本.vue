<template>
  <div>
    <h1>数据看板</h1>
    <line-chart :data="kpiData"></line-chart>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      kpiData: []
    };
  },
  async created() {
    const response = await axios.get("/api/kpis");
    this.kpiData = response.data.kpis;
  }
};
</script>
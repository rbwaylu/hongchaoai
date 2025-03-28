<template>
  <div>
    <input v-model="query" placeholder="输入咨询内容" @keyup.enter="searchKnowledge"/>
    <button @click="searchKnowledge">搜索</button>

    <div v-if="results">
      <p v-html="renderMarkdown(results.回复)"></p>
      <table>
        <tr>
          <td>情感分析</td>
          <td>{{ results.情感分析 }}</td>
        </tr>
        <tr>
          <td>推荐产品</td>
          <td>{{ results.推荐产品.名称 }} - {{ results.推荐产品.功能 }} - {{ results.推荐产品.价格 }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import marked from "marked";

export default {
  data() {
    return {
      query: "",
      results: null
    };
  },
  methods: {
    async searchKnowledge() {
      const response = await axios.get(`http://localhost:8000/search_knowledge?query=${this.query}`);
      this.results = response.data;
    },
    renderMarkdown(text) {
      return marked(text);
    }
  }
};
</script>

<template>
  <div class="search-page">
    <h1>搜索页面</h1>
    <el-input
      v-model="searchQuery"
      placeholder="请输入搜索内容"
      @input="handleSearchInput"
      class="search-input"
    />
    <div v-if="searchResults.length" class="search-results">
      <ul>
        <li v-for="result in searchResults" :key="result.id">
          {{ result.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      searchQuery: "", // 搜索输入
      searchResults: [], // 搜索结果
    };
  },
  methods: {
    // 处理搜索输入
    async handleSearchInput() {
      if (this.searchQuery.trim() === "") {
        this.searchResults = [];
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/search?q=${this.searchQuery}`);
        this.searchResults = response.data;
      } catch (error) {
        console.error("搜索出错:", error);
        this.searchResults = [];
      }
    },
  },
};
</script>

<style scoped>
.search-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
}

.search-input {
  width: 100%;
}

.search-results {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fff;
  padding: 10px;
}

.search-results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-results li {
  padding: 8px;
  cursor: pointer;
}

.search-results li:hover {
  background-color: #f0f0f0;
}
</style>
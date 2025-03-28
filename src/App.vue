<template>
  <div id="app">
    <!-- 标题和 logo -->
    <div class="header">
      <img src="/new-logo.png" alt="logo" class="logo" loading="lazy" />
      <h1>鸿潮AI客服营销系统</h1>
    </div>
    <p class="subtitle">像老朋友一样懂你，AI智能推荐总能把最适合的送到你面前❤️</p>

    <!-- 文件上传区域 -->
    <div class="upload-section">
      <div class="upload-header">
        <h2>上传企业知识库文件</h2>
        <el-button type="primary" @click="handleUpload">上传</el-button>
      </div>
      <input type="file" @change="handleFileChange" class="file-input" />
      <p v-if="uploadMessage" class="upload-message">{{ uploadMessage }}</p>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-container">
      <!-- 消息显示区域 -->
      <div class="message-area" ref="messageArea">
        <div v-for="(message, index) in messages" :key="index" :class="message.sender">
          <!-- 用户消息 -->
          <div v-if="message.sender === 'user'" class="message-bubble user-message">
            <div class="message-content">
              <strong>您：</strong>
              <p>{{ message.text }}</p>
            </div>
          </div>

          <!-- AI 消息 -->
          <div v-if="message.sender === 'ai'" class="message-bubble ai-message">
            <div class="message-content">
              <strong>AI 助手：</strong>
              <div v-html="renderMarkdown(message.text)"></div>
            </div>
            <el-button class="copy-button" @click="copyToClipboard(message.text)" size="mini" type="text">
              复制
            </el-button>
          </div>
        </div>
      </div>

      <!-- 输入框和提交按钮 -->
      <div class="input-area">
        <el-input
          v-model="userInput"
          placeholder="欢迎了解鸿朝AI眼镜！请输入您的问题，例如：鸿朝AI眼镜的功能是什么？"
          @keyup.enter="handleSubmit"
          class="input-box"
          :autosize="{ minRows: 1.5, maxRows: 6 }"
          type="textarea"
        />
        <el-button type="primary" @click="handleSubmit" class="submit-button" :disabled="loading">
          {{ loading ? "处理中..." : "提交" }}
        </el-button>

        <!-- 微信二维码区域 -->
        <div class="wechat-qrcode">
          <h3>商务合作</h3>
          <img src="/wechat.jpg" alt="微信二维码" loading="lazy" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { marked } from "marked";
import { ElMessage } from "element-plus";

export default {
  name: "App",
  data() {
    return {
      userInput: "", // 用户输入
      messages: [], // 聊天记录
      file: null, // 上传的文件
      uploadMessage: "", // 文件上传状态信息
      loading: false, // API 请求状态
      aiResponseBuffer: "", // AI 响应缓冲区
    };
  },
  methods: {
    // 提交问题：先保存当前输入并添加到消息列表，然后立即清空输入框
    async handleSubmit() {
      if (this.userInput.trim() === "") {
        this.$message.warning("请输入您的问题！");
        return;
      }

      const userMessage = this.userInput;
      // 立即将用户输入添加到消息列表，并清空输入框
      this.messages.push({ sender: "user", text: userMessage });
      this.userInput = "";
      this.scrollToBottom(); // 滚动到最新消息
      this.loading = true;

      try {
        // 在发送请求时立即添加空的 AI 消息
        const aiMessageIndex = this.messages.push({ sender: "ai", text: "" }) - 1;

        // 调用 DeepSeek API，使用流式响应
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer sk-a73c59ee94af4877aca9de14c1c588a6",
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7,
            stream: true, // 启用流式响应
          }),
        });

        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        this.aiResponseBuffer = "";

        let needsUpdate = false;

        const updateMessage = () => {
          if (needsUpdate && this.aiResponseBuffer) {
            this.messages[aiMessageIndex].text = this.aiResponseBuffer;
            this.scrollToBottom();
            needsUpdate = false;
          }
          if (this.loading) {
            requestAnimationFrame(updateMessage);
          }
        };

        requestAnimationFrame(updateMessage);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0].delta.content;
                if (content) {
                  this.aiResponseBuffer += content;
                  needsUpdate = true; // 标记需要更新
                }
              } catch (error) {
                console.error("解析错误:", error);
              }
            }
          }
        }

        // 确保最后的内容被渲染
        if (this.aiResponseBuffer) {
          this.messages[aiMessageIndex].text = this.aiResponseBuffer;
          this.scrollToBottom();
        }
      } catch (error) {
        console.error("请求出错:", error);
        this.messages.push({
          sender: "ai",
          text: `抱歉，AI 客服暂时无法处理您的请求。错误信息: ${error.message}`,
        });
        this.scrollToBottom();
      } finally {
        this.loading = false;
        this.aiResponseBuffer = "";
      }
    },

    // 处理文件选择
    handleFileChange(event) {
      this.file = event.target.files[0];
    },

    // 处理文件上传
    async handleUpload() {
      if (!this.file) {
        this.uploadMessage = "请选择一个文件";
        return;
      }
      const formData = new FormData();
      formData.append("file", this.file);
      try {
        const response = await axios.post("http://localhost:8000/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        this.uploadMessage = response.status === 200 ? "文件上传成功！" : "文件上传失败，请重试。";
      } catch (error) {
        console.error("上传错误:", error);
        this.uploadMessage = "文件上传失败，请重试。";
      }
    },

    // 使用 marked.js 渲染 Markdown
    renderMarkdown(text) {
      return marked(text);
    },

    // 复制文本到剪贴板
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        ElMessage.success("复制成功！");
      } catch (error) {
        console.error("复制失败:", error);
        ElMessage.error("复制失败，请手动复制。");
      }
    },

    // 滚动到消息展示区域的底部
    scrollToBottom() {
      this.$nextTick(() => {
        const messageArea = this.$refs.messageArea;
        if (messageArea) {
          messageArea.scrollTop = messageArea.scrollHeight;
        }
      });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  padding: 0 10px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.logo {
  width: 50px;
  height: 50px;
}

h1 {
  font-size: 24px;
  color: #409eff;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-top: 10px;
}

.upload-section {
  margin: 20px auto;
  max-width: 800px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
  text-align: center;
}

.upload-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.upload-header h2 {
  font-size: 18px;
  margin: 0;
}

.file-input {
  display: none;
}

.upload-message {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.chat-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
}

.message-area {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fff;
  text-align: left;
}

.message-bubble {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  word-wrap: break-word;
  position: relative;
}

.user-message {
  background-color: #409eff;
  color: #fff;
  text-align: left;
}

.ai-message {
  background-color: #f0f0f0;
  color: #333;
  text-align: left;
}

.message-content {
  line-height: 1.6;
  width: 100%;
}

.message-content strong {
  font-weight: bold;
}

.copy-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.input-area {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-box {
  flex: 1;
}

.submit-button {
  width: 100px;
  height: 100px;
}

.wechat-qrcode {
  background-color: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  max-width: 100px;
}

.wechat-qrcode h3 {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.wechat-qrcode img {
  width: 66.67px;
  height: 66.67px;
  margin-bottom: 5px;
}

.wechat-qrcode p {
  font-size: 10px;
  color: #666;
}

@media (max-width: 600px) {
  #app {
    padding: 10px;
  }
  .chat-container {
    padding: 10px;
    margin: 10px auto;
  }
  .message-area {
    height: 300px;
  }
  .input-area {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .wechat-qrcode {
    max-width: 80px;
    padding: 5px;
  }
  .wechat-qrcode h3 {
    font-size: 12px;
  }
  .wechat-qrcode img {
    width: 50px;
    height: 50px;
  }
  .wechat-qrcode p {
    font-size: 8px;
  }
  .submit-button {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
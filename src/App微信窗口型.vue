<template>
  <div id="app">
    <!-- 标题和 Logo -->
    <div class="header">
      <img src="/new-logo.png" alt="logo" class="logo" loading="lazy" />
      <h1>鸿潮AI客服营销系统</h1>
    </div>
    <p class="subtitle">AI助手，精准推荐，让选择更简单！</p>

    <!-- 文件上传区域 -->
    <div class="upload-section">
      <div class="upload-header">
        <h2>上传企业知识库文件</h2>
        <el-button type="primary" @click="handleUpload">上传</el-button>
      </div>
      <input type="file" @change-six="handleFileChange" class="file-input" />
      <p v-if="uploadMessage" class="upload-message">{{ uploadMessage }}</p>
    </div>

    <!-- 主内容区域（Grid 布局） -->
    <div class="main-container">
      <!-- 左侧推荐区 -->
      <div class="recommend-area">
        <h3>智能推荐</h3>
        <ul class="recommend-list">
          <li>
            <a href="#">鸿潮AI眼镜 - 轻便设计</a>
            <p>仅30g，支持实时导航</p>
          </li>
          <li>
            <a href="#">Ray-Ban Meta</a>
            <p>时尚外观，800元起</p>
          </li>
          <li>
            <a href="#">Even G1新品</a>
            <p>Micro-LED，1000尼特亮度</p>
          </li>
        </ul>
        <!-- 微信二维码 -->
        <div class="wechat-qrcode">
          <h4>商务合作</h4>
          <img src="/wechat.jpg" alt="微信二维码" loading="lazy" />
        </div>
      </div>

      <!-- 右侧聊天区 -->
      <div class="chat-area">
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

        <!-- 输入区域 -->
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
    async handleSubmit() {
      if (this.userInput.trim() === "") {
        this.$message.warning("请输入您的问题！");
        return;
      }

      const userMessage = this.userInput;
      this.messages.push({ sender: "user", text: userMessage });
      this.userInput = "";
      this.scrollToBottom();
      this.loading = true;

      try {
        const aiMessageIndex = this.messages.push({ sender: "ai", text: "" }) - 1;
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
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
        }

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
                  needsUpdate = true;
                }
              } catch (error) {
                console.error("解析错误:", error);
              }
            }
          }
        }

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

    handleFileChange(event) {
      this.file = event.target.files[0];
    },

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

    renderMarkdown(text) {
      return marked(text);
    },

    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        ElMessage.success("复制成功！");
      } catch (error) {
        console.error("复制失败:", error);
        ElMessage.error("复制失败，请手动复制。");
      }
    },

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

<style scoped>
#app {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 标题区域 */
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  width: 60px;
  height: 60px;
}

h1 {
  font-size: 28px;
  color: #2c3e50;
  font-weight: 600;
}

.subtitle {
  font-size: 16px;
  color: #7f8c8d;
  text-align: center;
  margin: 10px 0 20px;
}

/* 文件上传区域 */
.upload-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.upload-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.upload-header h2 {
  font-size: 18px;
  color: #2c3e50;
}

.file-input {
  display: none;
}

.upload-message {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

/* 主内容区域（Grid 布局） */
.main-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  height: calc(100vh - 300px);
}

/* 左侧推荐区 */
.recommend-area {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.recommend-area h3 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.recommend-list {
  list-style: none;
  padding: 0;
}

.recommend-list li {
  margin-bottom: 15px;
}

.recommend-list a {
  font-size: 16px;
  color: #409eff;
  text-decoration: none;
}

.recommend-list a:hover {
  text-decoration: underline;
}

.recommend-list p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 5px 0 0;
}

.wechat-qrcode {
  text-align: center;
}

.wechat-qrcode h4 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.wechat-qrcode img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
}

/* 右侧聊天区 */
.chat-area {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.message-area {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 18px;
  border-radius: 12px;
  margin-bottom: 15px;
  position: relative;
}

.user-message {
  background: #409eff;
  color: #fff;
  margin-left: auto;
  text-align: left;
}

.ai-message {
  background: #f0f0f0;
  color: #333;
  margin-right: auto;
  text-align: left;
}

.message-content strong {
  font-weight: 600;
}

.copy-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  color: #666;
}

.input-area {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.input-box {
  flex: 1;
}

.submit-button {
  width: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .recommend-area {
    margin-bottom: 20px;
  }

  .chat-area {
    height: 500px;
  }

  .input-area {
    flex-direction: column;
    gap: 10px;
  }

  .submit-button {
    width: 100%;
  }
}
</style>
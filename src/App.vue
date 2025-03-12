<template>
  <div id="app">
    <!-- 标题 -->
    <h1>鸿潮AI客服系统</h1>
    <p class="subtitle">您好！我是鸿朝AI 客服，可以帮您解答问题、处理任务，请随时告诉我您的需求。</p>

    <!-- 微信沟通入口 -->
    <div class="wechat-entry" @click="showWechatQRCode">
      <img src="https://cdn-icons-png.flaticon.com/512/1384/1384023.png" alt="微信图标" class="wechat-icon" />
      <span>微信沟通</span>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-container">
      <!-- 消息显示区域 -->
      <div class="message-area">
        <div v-for="(message, index) in messages" :key="index" :class="message.sender">
          <div class="message-bubble">
            {{ message.text }}
          </div>
        </div>
      </div>

      <!-- 输入框和提交按钮 -->
      <div class="input-area">
        <el-input
          v-model="userInput"
          placeholder="请输入您的问题"
          @keyup.enter="handleSubmit"
          class="input-box"
          :autosize="{ minRows: 2, maxRows: 6 }"
          type="textarea"
        />
        <el-button type="primary" @click="handleSubmit" class="submit-button">提交</el-button>
      </div>
    </div>

    <!-- 微信二维码弹窗 -->
    <el-dialog
      title="微信沟通"
      v-model:visible="wechatDialogVisible"
      width="300px"
      center
    >
      <div class="wechat-qrcode">
        <img src="https://via.placeholder.com/200x200.png?text=WeChat+QR+Code" alt="微信二维码" />
        <p>扫描二维码，添加微信客服</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      userInput: '', // 用户输入
      messages: [], // 聊天记录
      wechatDialogVisible: false // 微信二维码弹窗显示状态
    }
  },
  methods: {
    // 提交问题
    async handleSubmit() {
      if (this.userInput.trim() === '') {
        this.$message.warning('请输入您的问题！')
        return
      }

      // 添加用户消息到聊天记录
      this.messages.push({ sender: 'user', text: this.userInput })

      try {
        // 调用 DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-a73c59ee94af4877aca9de14c1c588a6' // 替换为你的真实 API Key
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "user",
                content: this.userInput
              }
            ],
            temperature: 0.7,
            stream: false
          })
        })

        // 检查响应状态
        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        // 添加 AI 回复到聊天记录
        this.messages.push({ sender: 'ai', text: data.choices[0].message.content })
      } catch (error) {
        console.error('请求出错:', error)
        this.messages.push({ sender: 'ai', text: '抱歉，AI 客服暂时无法处理您的请求。' })
      }

      // 清空输入框
      this.userInput = ''
    },

    // 显示微信二维码弹窗
    showWechatQRCode() {
      this.wechatDialogVisible = true
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

/* 副标题 */
.subtitle {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

/* 微信沟通入口 */
.wechat-entry {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  background-color: #409EFF;
  color: #fff;
  padding: 10px 15px;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.wechat-entry:hover {
  background-color: #66b1ff;
}

.wechat-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

/* 聊天容器 */
.chat-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
}

/* 消息显示区域 */
.message-area {
  height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fff;
}

/* 消息气泡 */
.message-bubble {
  max-width: 70%;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  word-wrap: break-word;
}

/* 用户消息 */
.user .message-bubble {
  background-color: #409EFF;
  color: #fff;
  margin-left: auto;
}

/* AI 消息 */
.ai .message-bubble {
  background-color: #f0f0f0;
  color: #333;
  margin-right: auto;
}

/* 输入区域 */
.input-area {
  display: flex;
  gap: 10px;
}

/* 输入框 */
.input-box {
  flex: 1;
}

/* 提交按钮 */
.submit-button {
  width: 100px;
  height: 60px; /* 与输入框高度一致 */
}

/* 微信二维码弹窗 */
.wechat-qrcode {
  text-align: center;
}

.wechat-qrcode img {
  width: 200px;
  height: 200px;
  margin-bottom: 10px;
}

.wechat-qrcode p {
  font-size: 14px;
  color: #666;
}
</style>
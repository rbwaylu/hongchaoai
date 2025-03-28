import React, { useState } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setInputText(''); // 立即清除输入框

    // 提交请求
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: inputText }),
      });
      const data = await response.json();
      console.log(data);

      // 轮询结果
      const pollResult = async () => {
        const resultResponse = await fetch('http://localhost:8000/api/chat/result');
        const resultData = await resultResponse.json();
        if (resultData.result) {
          setResult(resultData.result);
          setLoading(false);
        } else {
          setTimeout(pollResult, 1000); // 1秒后重试
        }
      };
      pollResult();
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Processing...' : 'Submit'}
      </button>
      {result && <div>{result}</div>}
    </div>
  );
}

export default App;
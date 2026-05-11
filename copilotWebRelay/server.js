// コメントを追加してワークフローが動くかテスト
// server.js
require('dotenv').config();
const express = require('express');
const { WebSocketServer } = require('ws');
const { CopilotClient, approveAll } = require('@github/copilot-sdk');

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express listening on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket接続確立');
  // Copilot セッション生成
  const copilot = new CopilotClient();
  copilot.createSession({
    model: 'gpt-3.5-turbo',
    onPermissionRequest: approveAll,
  }).then((session) => {
    session.on('assistant.message_delta', (msg) => {
      ws.send(JSON.stringify({ type: 'delta', data: msg }));
    });
    session.on('session.idle', () => {
      ws.send(JSON.stringify({ type: 'idle' }));
    });
    ws.on('message', (data) => {
        console.log('受信メッセージ:', data);
      const { type, content } = JSON.parse(data);
      if (type === 'user_message') {
        session.sendUserMessage(content);
      }
    });
    ws.on('close', () => {
        console.log('WebSocket切断');
      session.close();
    });
  }).catch((err) => {
    console.error('Copilotセッション生成エラー:', err);
    ws.send(JSON.stringify({ type: 'error', data: err.message || String(err) }));
  });
});

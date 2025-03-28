const socket = new WebSocket('ws://localhost:5000/ws');
socket.onmessage = (event) => {
  this.messages.push(event.data);
};
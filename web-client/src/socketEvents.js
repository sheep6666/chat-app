// socketEvents.ts
const SOCKET_EVENTS = {
  SERVER_ACTIVE_USERS: "server:active_users",         // WS → Client: 通知當前有誰在線上

  // 用戶
  CLIENT_USER_JOINED: "connection",                   // Client → WS: 某用戶已上線 (原生事件)  
  SERVER_USER_JOINED: "server:user_joined",           // WS → Client: 通知某用戶已上線 
  CLIENT_USER_LEFT: "disconnect",                     // Client → WS: 某用戶已下線 (原生事件) 
  SERVER_USER_LEFT: "server:user_left",               // WS → Client: 通知某用戶已下線 
  CLIENT_USER_TYPING: "client:user_typing",           // Client → WS: 某用戶正在輸入 
  SERVER_USER_TYPING: "server:user_typing",           // WS → Client: 通知某用戶正在輸入 

  // 訊息
  CLIENT_MESSAGE_SENT: "client:message_sent",         // Client → WS: 訊息已發送
  SERVER_MESSAGE_SENT: "server:message_sent",         // WS → Client: 通知訊息已發送
  CLIENT_MESSAGE_UPDATED: "client:message_updated",   // Client → WS: 訊息已更新
  SERVER_MESSAGE_UPDATED: "server:message_updated",   // WS → Client: 通知訊息已更新
};

export default SOCKET_EVENTS;
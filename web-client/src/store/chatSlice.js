import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { userLogout } from './authSlice';

// ==============================
// Thunks - Async Actions
// ==============================
export const getUsers = createAsyncThunk(
  'chat/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/messenger/users`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);
export const getChats = createAsyncThunk(
  'chat/getChats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/messenger/chats`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);
export const getChatMessages = createAsyncThunk(
  'chat/getChatMessages',
  async (_id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/messenger/chats/${_id}/messages`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messenger/sendMessage',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`http://localhost:5001/api/messenger/messages`, data, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);
export const createChatAndSendMessage = createAsyncThunk(
  'messenger/createChatAndSendMessage',
  async (data, { rejectWithValue }) => {
    try {
      const chatRes = await axios.post(`http://localhost:5001/api/messenger/chats`, {members: data.members}, {
        withCredentials: true
      });

      let messageWithChatId;
      if (data.message instanceof FormData){
        data.message.delete('chatId');
        data.message.append('chatId', chatRes.data.data._id);
        messageWithChatId = data.message;
      }
      else{
        messageWithChatId = { ...data.message, chatId: chatRes.data.data._id }
      }        

      const messageRes = await axios.post(`http://localhost:5001/api/messenger/messages`, messageWithChatId, {
        withCredentials: true
      });
      return {chat: chatRes.data.data, message: messageRes.data.data};
    } catch (err) {
      console.log(err)
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ==============================
// Redux Slice - Chat State Management
// ==============================
const initialState = {
  onlineUserMap: {},
  userMap: {},
  chatMap: {},
  chatUsers: {},
  selectedUserId: null,
  messages: [],
  draftMessage: '',
  isUserTyping: false,
  isMessageSent: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },
    setDraftMessage: (state, action) => {
      state.draftMessage = action.payload;
    },
    setChatUsers: (state, action) => {
      state.chatUsers = action.payload;
    },
    clearMessage: (state) => {
      state.messages = [];
    },
    setIsUserTyping: (state, action) => {
      state.isUserTyping = action.payload;
    },
    setOnlineUserMap: (state, action) => {
      const userIds = action.payload;
      state.onlineUserMap = userIds.reduce((acc, uid) => {
          acc[uid] = true;
          return acc;
        }, {});
    },
    updateOnlineUserMap: (state, action) => {
      state.onlineUserMap = {...state.onlineUserMap, ...action.payload}
    },
    clearIsMessageSent: (state) => {
      state.isMessageSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogout.fulfilled, (state, action) => {
          return initialState;
        })
      .addCase(getUsers.fulfilled, (state, action) => {
        const userArr = action.payload.data;
        state.userMap = userArr.reduce((acc, user) => {
          acc[user._id] = user;
          return acc;
        }, {});
      })
      .addCase(getChats.fulfilled, (state, action) => {
        const chatArr = action.payload.data;
        state.chatMap = chatArr.reduce((acc, chat) => {
          acc[chat._id] = chat;
          return acc;
        }, {});
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.messages = action.payload.data;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isMessageSent = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const newMessage = action.payload.data;
        state.messages = [...state.messages, newMessage];

        const chatId = newMessage.chatId
        const updatedChat = {...state.chatMap[chatId], lastMessage: newMessage}
        state.chatMap = {...state.chatMap, [updatedChat._id]: updatedChat} 
        state.draftMessage = '';
        state.isMessageSent = true;
      })
      .addCase(createChatAndSendMessage.pending, (state) => {
        state.isMessageSent = false;
      })
      .addCase(createChatAndSendMessage.fulfilled, (state, action) => {
        const {chat, message} = action.payload;
        state.messages = [...state.messages, message];
        
        const updatedChat = {...chat, lastMessage: message}
        state.chatMap = {...state.chatMap, [updatedChat._id]: updatedChat} 
        state.chatUsers = {...state.chatMap, [message.senderId]: updatedChat._id} 
        state.draftMessage = '';
        state.isMessageSent = true;
      })
  }
});

// ----------- 匯出 -----------

export const {
  setSelectedUserId,
  setDraftMessage,
  setChatUsers,
  clearMessage,
  setIsUserTyping,
  setOnlineUserMap,
  updateOnlineUserMap,
  clearIsMessageSent
} = chatSlice.actions;

export default chatSlice.reducer;
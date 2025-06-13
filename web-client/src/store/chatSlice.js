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
// ==============================
// Redux Slice - Chat State Management
// ==============================
const initialState = {
  userMap: {},
  chatMap: {},
  chatUsers: {},
  selectedUserId: null,
  messages: [],
  draftMessage: '',
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
  }
});

// ----------- 匯出 -----------

export const {
  setSelectedUserId,
  setDraftMessage,
  setChatUsers,
  clearMessage
} = chatSlice.actions;

export default chatSlice.reducer;
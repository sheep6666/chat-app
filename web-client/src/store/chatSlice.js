import { createSlice } from '@reduxjs/toolkit';
import { userLogout } from './authSlice';

const initialState = {
  selectedUserId: null,
  draftMessage: '',
};

const chatSlice = createSlice({
  name: 'messenger',
  initialState,
  reducers: {
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },
    setDraftMessage: (state, action) => {
      state.draftMessage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogout.fulfilled, (state, action) => {
          return initialState;
        })
  }
});

// ----------- 匯出 -----------

export const {
  setSelectedUserId,
  setDraftMessage
} = chatSlice.actions;

export default chatSlice.reducer;
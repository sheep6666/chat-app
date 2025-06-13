import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  draftMessage: '',
};

const chatSlice = createSlice({
  name: 'messenger',
  initialState,
  reducers: {
    setDraftMessage: (state, action) => {
      state.draftMessage = action.payload;
    }
  }
});

// ----------- 匯出 -----------

export const {
  setDraftMessage
} = chatSlice.actions;

export default chatSlice.reducer;
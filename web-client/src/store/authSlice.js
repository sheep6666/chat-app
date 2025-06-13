import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

// ==============================
// Utils
// ==============================
const decodeValidJWT = (token) => {
  try {
    const decoded = jwtDecode(token);
    const now = Date.now();
    const exp = decoded.exp * 1000;
    if (now > exp) return null;
    return decoded;
  } catch {
    return null;
  }
};

const getValidDecodedToken = () => {
  const token = localStorage.getItem('authToken');
  return token ? decodeValidJWT(token) : null;
};
// ==============================
// Thunks - Async Actions
// ==============================
export const userRegister = createAsyncThunk(
  'auth/userRegister',
  async (formData, { rejectWithValue }) => {
    console.log("userRegister")
    try {
      const reqConfig = { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true };
      const res = await axios.post(`http://localhost:5001/api/auth/users`, formData, reqConfig);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const userLogin = createAsyncThunk(
  'auth/userLogin',
  async (data, { rejectWithValue }) => {
    try {
      const reqConfig = { headers: { 'Content-Type': 'application/json'}, withCredentials: true};
      const res = await axios.post(`http://localhost:5001/api/auth/login`, data, reqConfig);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// ==============================
// Redux Slice - Auth State Management
// ==============================
const initialState = {
  currentUser: getValidDecodedToken(),
  toastQueue: []                        // array of {type, message}
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearToastQueue: (state) => {
      state.toastQueue = []; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userRegister.fulfilled, (state, action) => {
        const jwtToken = action.payload.data.token;
        state.currentUser = decodeValidJWT(action.payload.data.token);
        state.toastQueue = [...state.toastQueue, {type: 'success', message: action.payload.message}]
        localStorage.setItem('authToken', action.payload.data.token);
      })
      .addCase(userRegister.rejected, (state, action) => {
        const errorToasts = action.payload.errors.map(o=>{return {type: 'error', message: o}})
        state.toastQueue = [...state.toastQueue, ...errorToasts]
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.currentUser = decodeValidJWT(action.payload.data.token);
        state.toastQueue = [...state.toastQueue, {type: 'success', message: action.payload.message}]
        localStorage.setItem('authToken', action.payload.data.token);
      })
      .addCase(userLogin.rejected, (state, action) => {
        const errorToasts = action.payload.errors.map(o=>{return {type: 'error', message: o}})
        state.toastQueue = [...state.toastQueue, ...errorToasts]
      })
  }
});

export const { clearToastQueue } = authSlice.actions;
export default authSlice.reducer;

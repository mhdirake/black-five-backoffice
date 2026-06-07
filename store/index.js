import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice';

const appReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
  },
});

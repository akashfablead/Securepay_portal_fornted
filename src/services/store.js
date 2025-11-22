import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
// path to your slice

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

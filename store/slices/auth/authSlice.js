import authApi from "./authApi";
import { createSlice } from "@reduxjs/toolkit";
import { createThunkFromApi } from "@/store/utils";

export const login = createThunkFromApi("auth/login", authApi.login);

export const register = createThunkFromApi("auth/register", authApi.register);

export const updateUserOnboarding = createThunkFromApi("auth/updateUserOnboarding", authApi.userOnboarding);

export const getUserInformation = createThunkFromApi("auth/getUserInformation", authApi.userInformation);

export const logout = createThunkFromApi("auth/logout", authApi.logout);

const initialState = {
  userInformation: null
};

export const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setUser(state, { payload }) {
      state.userInformation = payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, { payload }) => {
      // window.localStorage.setItem(AUTH_TOKEN, payload?.data)
    })

    builder.addCase(getUserInformation.fulfilled, (state, { payload }) => {
      state.userInformation = payload
    })
  },
});

export const { setUser } = authSlice.actions;

export default authSlice.reducer;

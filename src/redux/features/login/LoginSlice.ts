import type { LoginResponse, User } from "../../../types/Types";
import { createSlice } from "@reduxjs/toolkit";
import { login } from "./AsyncThunks";



const loginSlice = createSlice({
    name: "login",
    initialState: {
        isLoading: false,
        isError: false,
        errorMessage: null as string | null,
        user: null as User | null,
        token: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.errorMessage = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            const loginResponse = action.payload as LoginResponse;
            state.isLoading = false;
            state.user = loginResponse.data.user;
            state.token = loginResponse.data.token;
            localStorage.setItem("token", loginResponse.data.token);
            state.isError = false;
            state.errorMessage = null;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.errorMessage = action.payload as string;
        });
    }
});

export default loginSlice.reducer;
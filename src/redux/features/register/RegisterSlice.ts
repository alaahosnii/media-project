import type { LoginResponse, User } from "../../../types/Types";
import { createSlice } from "@reduxjs/toolkit";
import { register } from "./AsyncThunks";



const registerSlice = createSlice({
    name: "register",
    initialState: {
        isLoading: false,
        isError: false,
        errorMessage: null as string | null,
        user: null as User | null,
        token: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(register.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.errorMessage = null;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            const loginResponse = action.payload as LoginResponse;
            state.isLoading = false;
            state.user = loginResponse.data.user;
            state.token = loginResponse.data.token;
            localStorage.setItem("token", loginResponse.data.token);
            state.isError = false;
            state.errorMessage = null;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.errorMessage = action.payload as string;
        });
    }
});

export default registerSlice.reducer;
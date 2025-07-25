import type { ErrorResponse, LoginForm } from "../../../types/Types";
import axiosInstance from "../../../utils/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

export const login = createAsyncThunk(
    "login/login",
    async (loginData: LoginForm, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/login", loginData);
            return response.data;
        } catch (error: unknown) {
            const errorResponse = error as AxiosError<ErrorResponse>;
            return rejectWithValue(errorResponse.response?.data.message);
        }
    }
);

// export const register = createAsyncThunk(
//     "login/register",
//     async (registerData: RegisterForm, { rejectWithValue }) => {
//         try {
//             const response = await axiosInstance.post("/api/register", registerData);
//             return response.data;
//         } catch (error: unknown) {
//             const errorResponse = error as AxiosError<ErrorResponse>;
//             return rejectWithValue(errorResponse.response?.data.message);
//         }
//     }
// );  
import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';
//For automatically including the cookies in the requests (headers)
axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name,
      });
      console.log('Signup', response);
      set({
        user: response.data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.log('Signup', error.response.data);
      set({
        error: error.response.data.message || 'Error signing up',
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (verificationCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, {
        verificationCode,
      });
      console.log('verifyEmail', response);
      set({
        user: response.data.data,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.log('verifyEmail', error.response.data);
      set({
        error: error.response.data.message || 'Error signing up',
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      console.log('checkAuth', response);
      set({
        user: response.data.data,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      console.log('checkAuth', error.response.data);
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
    }
  },

  logIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      console.log('Login', response);
      set({
        user: response.data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.log('Login', error.response.data);
      set({
        error: error.response.data.message || 'Error logging in',
        isLoading: false,
      });
      throw error;
    }
  },

  logOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/logout`);
      console.log('Logout', response.data);
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      console.log('Logout', error.response.data);
      set({
        error: error.response.data.message || 'Error logging out',
        isLoading: false,
      });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      console.log('Forgot Password', response.data);
      set({ isLoading: false, message: response.data.message });
    } catch (error) {
      console.log('Forgot Password', error.response.data);
      set({
        error: error.response.data.message || 'Error resetting password',
        isLoading: false,
      });
      throw error;
    }
  },

  resetPassword: async (password, token) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        password,
      });
      console.log('Reset Password', response.data);
      set({ isLoading: false, message: response.data.message });
    } catch (error) {
      console.log('Reset Password', error.response.data);
      set({
        error: error.response.data.message || 'Error resetting password',
        isLoading: false,
      });
      throw error;
    }
  },
}));

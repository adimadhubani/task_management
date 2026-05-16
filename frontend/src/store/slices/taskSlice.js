import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = "https://content-education-production-817d.up.railway.app/api" || 'http://localhost:5001/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}) => {
    const response = await axios.get(`${API_URL}/tasks`, { params });
    return response.data;
  }
);

export const fetchTaskStatistics = createAsyncThunk(
  'tasks/fetchStatistics',
  async () => {
    const response = await axios.get(`${API_URL}/tasks/statistics`);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (formData) => {
    const response = await axios.post(`${API_URL}/tasks`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }) => {
    const response = await axios.put(`${API_URL}/tasks/${id}`, data);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id) => {
    await axios.delete(`${API_URL}/tasks/${id}`);
    return id;
  }
);

const initialState = {
  tasks: [],
  statistics: null,
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTaskStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload.task);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.task.id);
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      });
  },
});

export const { setPage } = taskSlice.actions;
export default taskSlice.reducer;
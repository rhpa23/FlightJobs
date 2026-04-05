import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jobsApi } from '../../services/api';

interface Job {
  id: number;
  departureICAO: string;
  arrivalICAO: string;
  alternativeICAO?: string;
  distance: number;
  pax: number;
  cargo: number;
  pay: number;
  isDone: boolean;
  isActivated: boolean;
  inProgress: boolean;
  startTime: string;
  endTime: string;
  modelName?: string;
  modelDescription?: string;
  aviationType?: number;
  startFuelWeight?: number;
  finishFuelWeight?: number;
  weightUnit?: string;
}

interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  pendingJobs: Job[];
  searchResults: Job[];
  isLoading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  pendingJobs: [],
  searchResults: [],
  isLoading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const response = await jobsApi.getJobs();
  return response;
});

export const fetchJob = createAsyncThunk('jobs/fetchJob', async (id: number) => {
  const response = await jobsApi.getJob(id);
  return response;
});

export const createJob = createAsyncThunk('jobs/createJob', async (jobData: Partial<Job>) => {
  const response = await jobsApi.createJob(jobData);
  return response;
});

export const updateJob = createAsyncThunk('jobs/updateJob', async ({ id, data }: { id: number; data: Partial<Job> }) => {
  const response = await jobsApi.updateJob(id, data);
  return response;
});

export const deleteJob = createAsyncThunk('jobs/deleteJob', async (id: number) => {
  await jobsApi.deleteJob(id);
  return id;
});

export const searchJobs = createAsyncThunk('jobs/searchJobs', async (params: any) => {
  const response = await jobsApi.searchJobs(params);
  return response;
});

export const generateJobs = createAsyncThunk('jobs/generateJobs', async (params: any) => {
  const response = await jobsApi.generateJobs(params);
  return response;
});

export const activateJob = createAsyncThunk('jobs/activateJob', async (id: number) => {
  const response = await jobsApi.activateJob(id);
  return response;
});

export const completeJob = createAsyncThunk('jobs/completeJob', async ({ id, data }: { id: number; data: any }) => {
  const response = await jobsApi.completeJob(id, data);
  return response;
});

export const fetchPendingJobs = createAsyncThunk('jobs/fetchPendingJobs', async () => {
  const response = await jobsApi.getPendingJobs();
  return response;
});

export const fetchActiveJob = createAsyncThunk('jobs/fetchActiveJob', async () => {
  const response = await jobsApi.getActiveJob();
  return response;
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentJob: (state, action: PayloadAction<Job | null>) => {
      state.currentJob = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.currentJob = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.push(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(job => job.id !== action.payload);
        if (state.currentJob?.id === action.payload) {
          state.currentJob = null;
        }
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(generateJobs.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(activateJob.fulfilled, (state, action) => {
        state.currentJob = action.payload;
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(completeJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = null;
        }
      })
      .addCase(fetchPendingJobs.fulfilled, (state, action) => {
        state.pendingJobs = action.payload;
      })
      .addCase(fetchActiveJob.fulfilled, (state, action) => {
        state.currentJob = action.payload;
      });
  },
});

export const { clearError, setCurrentJob, clearSearchResults } = jobsSlice.actions;
export default jobsSlice.reducer;

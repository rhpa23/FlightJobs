import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileApi } from '../../services/api';

// Logbook entry type
interface LogbookEntry {
  id: number;
  departureICAO: string;
  arrivalICAO: string;
  modelDescription: string;
  modelName: string;
  distance: number;
  pax: number;
  cargo: number;
  payload: number;
  payloadDisplay: string;
  pay: number;
  flightTime: string;
  usedFuelWeight: number;
  usedFuelWeightDisplay: string;
  startTime: string;
  endTime: string;
  videoUrl?: string;
  videoDescription?: string;
}

// License item type
interface LicenseItem {
  id: number;
  name: string;
  price: number;
  image: string;
  isBought: boolean;
  licenseExpenseId: number;
}

// License expense type
interface LicenseExpense {
  id: number;
  pilotLicenseExpenseId: number;
  name: string;
  maturityDate: string;
  isOverdue: boolean;
  items: LicenseItem[];
}

// Graduation type
interface Graduation {
  name: string;
  minHours: number;
  maxHours: number | null;
}

// Profile state
interface ProfileState {
  logbook: {
    entries: LogbookEntry[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    isLoading: boolean;
  };
  licenses: {
    expenses: LicenseExpense[];
    selectedExpense: LicenseExpense | null;
    isLoading: boolean;
  };
  graduations: Graduation[];
  currentBankBalance: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  logbook: {
    entries: [],
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    isLoading: false,
  },
  licenses: {
    expenses: [],
    selectedExpense: null,
    isLoading: false,
  },
  graduations: [],
  currentBankBalance: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchLogbook = createAsyncThunk(
  'profile/fetchLogbook',
  async (params?: {
    pageNumber?: number;
    pageSize?: number;
    sortOrder?: string;
    departureFilter?: string;
    arrivalFilter?: string;
    modelDescriptionFilter?: string;
  }) => {
    const response = await profileApi.getLogbook(params);
    return response;
  }
);

export const deleteLogbookJob = createAsyncThunk(
  'profile/deleteLogbookJob',
  async (jobId: number) => {
    const response = await profileApi.deleteJob(jobId);
    return response;
  }
);

export const fetchLicenses = createAsyncThunk(
  'profile/fetchLicenses',
  async () => {
    const response = await profileApi.getLicenses();
    return response;
  }
);

export const fetchLicenseItems = createAsyncThunk(
  'profile/fetchLicenseItems',
  async (licenseExpenseId: number) => {
    const response = await profileApi.getLicenseItems(licenseExpenseId);
    return { licenseExpenseId, items: response };
  }
);

export const purchaseLicenseItem = createAsyncThunk(
  'profile/purchaseLicenseItem',
  async (licenseItemId: number) => {
    const response = await profileApi.buyLicenseItem(licenseItemId);
    return response;
  }
);

export const buyAllLicenseItems = createAsyncThunk(
  'profile/buyAllLicenseItems',
  async (licenseExpenseId: number) => {
    const response = await profileApi.buyAllLicenseItems(licenseExpenseId);
    return response;
  }
);

export const transferFunds = createAsyncThunk(
  'profile/transferFunds',
  async (percent: number) => {
    const response = await profileApi.pilotTransfer(percent);
    return response;
  }
);

export const fetchGraduations = createAsyncThunk(
  'profile/fetchGraduations',
  async () => {
    const response = await profileApi.getGraduations();
    return response;
  }
);

export const updateAvatar = createAsyncThunk(
  'profile/updateAvatar',
  async (avatarIndex: number) => {
    const response = await profileApi.updateAvatar(avatarIndex);
    return response;
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedLicenseExpense: (state, action: PayloadAction<LicenseExpense | null>) => {
      state.licenses.selectedExpense = action.payload;
    },
    setLogbookPageSize: (state, action: PayloadAction<number>) => {
      state.logbook.pageSize = action.payload;
    },
    updateLogbookEntry: (state, action: PayloadAction<LogbookEntry>) => {
      const index = state.logbook.entries.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.logbook.entries[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Logbook
      .addCase(fetchLogbook.pending, (state) => {
        state.logbook.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLogbook.fulfilled, (state, action) => {
        state.logbook.isLoading = false;
        state.logbook.entries = action.payload.entries || [];
        state.logbook.totalCount = action.payload.totalCount || 0;
        state.logbook.currentPage = action.payload.currentPage || 1;
        state.logbook.pageSize = action.payload.pageSize || 10;
      })
      .addCase(fetchLogbook.rejected, (state, action) => {
        state.logbook.isLoading = false;
        state.error = action.error.message || 'Failed to fetch logbook';
      })
      // Delete Logbook Job
      .addCase(deleteLogbookJob.fulfilled, (state, action) => {
        state.logbook.entries = state.logbook.entries.filter(
          (e) => e.id !== action.payload.jobId
        );
      })
      // Fetch Licenses
      .addCase(fetchLicenses.pending, (state) => {
        state.licenses.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLicenses.fulfilled, (state, action) => {
        state.licenses.isLoading = false;
        state.licenses.expenses = action.payload || [];
      })
      .addCase(fetchLicenses.rejected, (state, action) => {
        state.licenses.isLoading = false;
        state.error = action.error.message || 'Failed to fetch licenses';
      })
      // Fetch License Items
      .addCase(fetchLicenseItems.fulfilled, (state, action) => {
        const { licenseExpenseId, items } = action.payload;
        const expense = state.licenses.expenses.find((e) => e.pilotLicenseExpenseId === licenseExpenseId);
        if (expense) {
          expense.items = items;
        }
        state.licenses.selectedExpense = expense || null;
      })
      // Purchase License Item
      .addCase(purchaseLicenseItem.fulfilled, (state, action) => {
        state.currentBankBalance = action.payload.newBalance;
        // Update the bought status of the item
        if (state.licenses.selectedExpense) {
          const itemIndex = state.licenses.selectedExpense.items.findIndex(
            (i) => i.id === action.payload.itemId
          );
          if (itemIndex !== -1) {
            state.licenses.selectedExpense.items[itemIndex].isBought = true;
          }
        }
      })
      // Buy All License Items
      .addCase(buyAllLicenseItems.fulfilled, (state, action) => {
        state.currentBankBalance = action.payload.newBalance;
        // Mark all items as bought
        if (state.licenses.selectedExpense) {
          state.licenses.selectedExpense.items.forEach((item) => {
            item.isBought = true;
          });
        }
      })
      // Fetch Graduations
      .addCase(fetchGraduations.fulfilled, (state, action) => {
        state.graduations = action.payload || [];
      });
  },
});

export const {
  clearError,
  setSelectedLicenseExpense,
  setLogbookPageSize,
  updateLogbookEntry,
} = profileSlice.actions;

export default profileSlice.reducer;

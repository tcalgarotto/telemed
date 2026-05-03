import { create } from "zustand";
import type { Consultation, Prescription } from "@telemed/shared";
import { consultationsApi, prescriptionsApi } from "@/services/api";

interface AppDataState {
  consultations: Consultation[];
  prescriptions: Prescription[];
  isLoadingConsultations: boolean;
  isLoadingPrescriptions: boolean;
  fetchConsultations: () => Promise<void>;
  fetchPrescriptions: () => Promise<void>;
  addConsultation: (consultation: Consultation) => void;
}

export const useAppDataStore = create<AppDataState>((set) => ({
  consultations: [],
  prescriptions: [],
  isLoadingConsultations: false,
  isLoadingPrescriptions: false,

  fetchConsultations: async () => {
    set({ isLoadingConsultations: true });
    try {
      const consultations = await consultationsApi.list();
      set({ consultations, isLoadingConsultations: false });
    } catch {
      set({ isLoadingConsultations: false });
    }
  },

  fetchPrescriptions: async () => {
    set({ isLoadingPrescriptions: true });
    try {
      const prescriptions = await prescriptionsApi.list();
      set({ prescriptions, isLoadingPrescriptions: false });
    } catch {
      set({ isLoadingPrescriptions: false });
    }
  },

  addConsultation: (consultation) => {
    set((state) => ({
      consultations: [consultation, ...state.consultations],
    }));
  },
}));

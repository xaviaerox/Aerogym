import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DashboardWidgets {
  sessionsCount: boolean;
  streak: boolean;
  readiness: boolean;
  nextRoutine: boolean;
  quickLogger: boolean;
  water: boolean;
  steps: boolean;
  stoicQuote: boolean;
  lastWorkout: boolean;
}

interface UIState {
  visibleWidgets: DashboardWidgets;
  toggleWidgetVisibility: (widget: keyof DashboardWidgets) => void;
  resetWidgets: () => void;
}

const defaultWidgets: DashboardWidgets = {
  sessionsCount: true,
  streak: true,
  readiness: true,
  nextRoutine: true,
  quickLogger: true,
  water: true,
  steps: true,
  stoicQuote: true,
  lastWorkout: true,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      visibleWidgets: defaultWidgets,
      
      toggleWidgetVisibility: (widget) => {
        set((state) => ({
          visibleWidgets: {
            ...state.visibleWidgets,
            [widget]: !state.visibleWidgets[widget],
          },
        }));
      },

      resetWidgets: () => {
        set({ visibleWidgets: defaultWidgets });
      },
    }),
    {
      name: 'aerogym-ui-storage', // key en localStorage
    }
  )
);

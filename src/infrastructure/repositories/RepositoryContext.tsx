import React, { createContext, useContext } from 'react';
import type { IWorkoutRepository } from './IWorkoutRepository';
import type { IHealthRepository } from './IHealthRepository';
import { supabaseWorkoutRepository } from './SupabaseWorkoutRepository';
import { supabaseHealthRepository } from './SupabaseHealthRepository';

export interface RepositoryContextType {
  workoutRepository: IWorkoutRepository;
  healthRepository: IHealthRepository;
}

const RepositoryContext = createContext<RepositoryContextType>({
  workoutRepository: supabaseWorkoutRepository,
  healthRepository: supabaseHealthRepository,
});

export interface RepositoryProviderProps {
  children: React.ReactNode;
  workoutRepository?: IWorkoutRepository;
  healthRepository?: IHealthRepository;
}

export const RepositoryProvider: React.FC<RepositoryProviderProps> = ({
  children,
  workoutRepository = supabaseWorkoutRepository,
  healthRepository = supabaseHealthRepository,
}) => {
  const value = React.useMemo(
    () => ({ workoutRepository, healthRepository }),
    [workoutRepository, healthRepository]
  );

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
};

export function useRepositories(): RepositoryContextType {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepositories debe usarse dentro de un RepositoryProvider');
  }
  return context;
}

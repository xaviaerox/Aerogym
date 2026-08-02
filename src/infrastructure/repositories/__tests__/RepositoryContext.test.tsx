import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { RepositoryProvider, useRepositories } from '../RepositoryContext';

describe('RepositoryContext', () => {
  it('provides default Supabase repository instances', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RepositoryProvider>{children}</RepositoryProvider>
    );

    const { result } = renderHook(() => useRepositories(), { wrapper });

    expect(result.current.workoutRepository).toBeDefined();
    expect(result.current.healthRepository).toBeDefined();
  });
});

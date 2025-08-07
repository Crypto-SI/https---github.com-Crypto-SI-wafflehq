import { useState, useCallback } from 'react';

// Generic optimistic update hook
export function useOptimisticUpdates<T extends { id?: string; user_id?: string }>(
  initialData: T[],
  idField: keyof T = 'id' as keyof T
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(initialData);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  // Update the base data when it changes
  const updateBaseData = useCallback((newData: T[]) => {
    setOptimisticData(newData);
  }, []);

  // Optimistically add an item
  const optimisticAdd = useCallback((item: T, operation: () => Promise<T>) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...item, [idField]: tempId } as T;
    
    // Add to optimistic data immediately
    setOptimisticData(prev => [optimisticItem, ...prev]);
    setPendingOperations(prev => new Set(prev).add(tempId));

    return operation()
      .then((result) => {
        // Replace optimistic item with real result
        setOptimisticData(prev => 
          prev.map(existing => 
            existing[idField] === tempId ? result : existing
          )
        );
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
        return result;
      })
      .catch((error) => {
        // Remove optimistic item on error
        setOptimisticData(prev => 
          prev.filter(existing => existing[idField] !== tempId)
        );
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
        throw error;
      });
  }, [idField]);

  // Optimistically update an item
  const optimisticUpdate = useCallback((id: string, updates: Partial<T>, operation: () => Promise<T>) => {
    const originalItem = optimisticData.find(item => item[idField] === id);
    if (!originalItem) return operation();

    // Apply updates optimistically
    const optimisticItem = { ...originalItem, ...updates };
    setOptimisticData(prev => 
      prev.map(existing => 
        existing[idField] === id ? optimisticItem : existing
      )
    );
    setPendingOperations(prev => new Set(prev).add(id));

    return operation()
      .then((result) => {
        // Replace with real result
        setOptimisticData(prev => 
          prev.map(existing => 
            existing[idField] === id ? result : existing
          )
        );
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        return result;
      })
      .catch((error) => {
        // Revert to original on error
        setOptimisticData(prev => 
          prev.map(existing => 
            existing[idField] === id ? originalItem : existing
          )
        );
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        throw error;
      });
  }, [optimisticData, idField]);

  // Optimistically delete an item
  const optimisticDelete = useCallback((id: string, operation: () => Promise<void>) => {
    const originalItem = optimisticData.find(item => item[idField] === id);
    if (!originalItem) return operation();

    // Remove optimistically
    setOptimisticData(prev => prev.filter(existing => existing[idField] !== id));
    setPendingOperations(prev => new Set(prev).add(id));

    return operation()
      .then(() => {
        // Operation succeeded, keep removed
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      })
      .catch((error) => {
        // Restore item on error
        setOptimisticData(prev => [originalItem, ...prev]);
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        throw error;
      });
  }, [optimisticData, idField]);

  // Check if an item is pending
  const isPending = useCallback((id: string) => {
    return pendingOperations.has(id);
  }, [pendingOperations]);

  return {
    data: optimisticData,
    updateBaseData,
    optimisticAdd,
    optimisticUpdate,
    optimisticDelete,
    isPending,
    hasPendingOperations: pendingOperations.size > 0
  };
}

// Specific hook for subscriber optimistic updates
export function useOptimisticSubscribers(initialSubscribers: any[]) {
  return useOptimisticUpdates(initialSubscribers, 'user_id');
}

// Specific hook for gem optimistic updates
export function useOptimisticGems(initialGems: any[]) {
  return useOptimisticUpdates(initialGems, 'id');
}
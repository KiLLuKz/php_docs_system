import { useRef, useEffect, useCallback } from 'react';

export default function usePendingDeletes() {
  const pendingDeletes = useRef([]);

  const registerDelete = useCallback((id, callback) => {
    pendingDeletes.current.push({ id, callback });
  }, []);

  const unregisterDelete = useCallback((id) => {
    pendingDeletes.current = pendingDeletes.current.filter((item) => item.id !== id);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (pendingDeletes.current.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (pendingDeletes.current.length > 0) {
        pendingDeletes.current.forEach((item) => {
          try {
            item.callback();
          } catch (err) {
            console.error('Error executing pending delete on unmount', err);
          }
        });
        pendingDeletes.current = [];
      }
    };
  }, []);

  return { registerDelete, unregisterDelete };
}

// components/error-handler.tsx (or wherever you placed it)
'use client';
import { useEffect } from 'react';

export function SilenceSpecificPromiseRejection() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      // --- ADD THIS LOGGING ---
      console.log(
        '[Silence Handler] Unhandled Rejection Detected. Reason:',
        event.reason,
      );
      // --- END LOGGING ---

      if (
        event.reason &&
        typeof event.reason === 'object' &&
        event.reason.type === 'cancelation' &&
        event.reason.msg === 'operation is manually canceled'
      ) {
        // --- ADD THIS LOGGING ---
        console.log(
          '[Silence Handler] MATCHED cancellation object, preventing default.',
        );
        // --- END LOGGING ---
        event.preventDefault();
      } else {
        // --- ADD THIS LOGGING ---
        console.log('[Silence Handler] Did NOT match cancellation object.');
        // --- END LOGGING ---
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
  return null;
}

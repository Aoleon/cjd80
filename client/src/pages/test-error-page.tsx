import { useEffect, useState } from 'react';

function BrokenComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('Test error triggered for E2E testing');
  }
  return <div>No error</div>;
}

export default function TestErrorPage() {
  const [shouldError, setShouldError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('trigger') === 'error') {
      setShouldError(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Test Error Page</h1>
        <p className="mb-4">
          This page is used for E2E testing of the Error Boundary.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Add ?trigger=error to the URL to trigger a React error.
        </p>
        <BrokenComponent shouldError={shouldError} />
      </div>
    </div>
  );
}

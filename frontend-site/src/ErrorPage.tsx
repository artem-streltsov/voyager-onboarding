import React from 'react';
import { useRouteError } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error = useRouteError() as Error;

  return (
    <div className="error-page">
      <h1>Oops! Something went wrong.</h1>
      <p>We're sorry, but an error occurred while processing your request.</p>
      <p>Error details: {error?.message || 'Unknown error'}</p>
    </div>
  );
};

export default ErrorPage;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

// Check if we have valid Cognito configuration for authentication
const hasValidCognitoConfig = process.env.REACT_APP_USER_POOL_ID && process.env.REACT_APP_USER_POOL_CLIENT_ID;

interface AuthWrapperProps {
  children: React.ReactNode;
}

// Component that handles authentication when Cognito is configured
const AuthenticatedWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  // Show loading while checking authentication status
  if (authStatus === 'configuring') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not authenticated, show login form
  if (authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Authenticator
          signUpAttributes={['email', 'name']}
          loginMechanisms={['email']}
          socialProviders={[]}
        />
      </div>
    );
  }

  // If authenticated, render the protected content
  if (authStatus === 'authenticated') {
    return <>{children}</>;
  }

  // Default fallback (should not be reached in normal flow)
  return <Navigate to="/dashboard" replace />;
};

// Main wrapper component
const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  // Skip authentication entirely in local development if Cognito is not configured
  if (!hasValidCognitoConfig) {
    return <>{children}</>;
  }

  // Use authenticated wrapper when Cognito is configured
  return <AuthenticatedWrapper>{children}</AuthenticatedWrapper>;
};

export default AuthWrapper;

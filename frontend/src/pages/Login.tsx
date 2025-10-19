import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthenticator();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            SecureAuditAI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your compliance dashboard
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Authenticator
            signUpAttributes={[
              'email',
              'name'
            ]}
          >
            {({ signOut, user }) => (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Welcome back, {user?.attributes?.name || user?.attributes?.email}!
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            )}
          </Authenticator>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

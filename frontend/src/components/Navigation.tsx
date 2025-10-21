import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Button } from './ui/button';

// Check if we have valid Cognito configuration for authentication
const hasValidCognitoConfig = process.env.REACT_APP_USER_POOL_ID && process.env.REACT_APP_USER_POOL_CLIENT_ID;

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    description: 'Compliance overview and metrics'
  },
  {
    path: '/audit-control',
    label: 'Audit Control',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    description: 'Manage and trigger audits'
  },
  {
    path: '/findings',
    label: 'Findings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    description: 'Security findings and issues'
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: 'Compliance reports and exports'
  },
];

// Logo component
const Logo: React.FC = () => (
  <Link to="/dashboard" className="flex items-center space-x-3 group">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors duration-200">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
    </div>
    <div className="hidden sm:block">
      <h1 className="text-xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors duration-200">
        SecureAuditAI
      </h1>
      <p className="text-xs text-neutral-500 -mt-1">Compliance Monitoring</p>
    </div>
  </Link>
);

// Navigation links component
const NavLinks: React.FC<{ mobile?: boolean }> = ({ mobile = false }) => {
  const location = useLocation();

  const linkClasses = mobile
    ? "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 hover:bg-neutral-50"
    : "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-neutral-50";

  const activeClasses = mobile
    ? "bg-primary-50 text-primary-700 border border-primary-200"
    : "bg-primary-50 text-primary-700 border border-primary-200";

  const inactiveClasses = mobile
    ? "text-neutral-600 hover:text-neutral-900"
    : "text-neutral-600 hover:text-neutral-900";

  return (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${linkClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <div className={mobile ? "flex-1" : ""}>
              <div className="font-medium">{item.label}</div>
              {mobile && (
                <div className="text-xs text-neutral-500 mt-0.5">
                  {item.description}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </>
  );
};

// User menu component
const UserMenu: React.FC = () => {
  const { signOut, user } = useAuthenticator();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-neutral-900">
            {user?.attributes?.name || 'User'}
          </div>
          <div className="text-xs text-neutral-500">
            {user?.attributes?.email}
          </div>
        </div>
        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-neutral-200 z-20">
            <div className="p-4 border-b border-neutral-200">
              <div className="text-sm font-medium text-neutral-900">
                {user?.attributes?.name || 'User'}
              </div>
              <div className="text-xs text-neutral-500">
                {user?.attributes?.email}
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={signOut}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Navigation component for when authentication is available
const AuthenticatedNavigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            <NavLinks />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <UserMenu />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-neutral-50">
          <div className="px-4 py-4 space-y-2">
            <NavLinks mobile />
          </div>
        </div>
      )}
    </nav>
  );
};

// Navigation component for when authentication is not available (local development)
const UnauthenticatedNavigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            <NavLinks />
          </div>

          {/* Development indicator */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-warning-50 text-warning-700 text-sm font-medium rounded-full border border-warning-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Development Mode</span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-neutral-50">
          <div className="px-4 py-4 space-y-2">
            <NavLinks mobile />
            <div className="pt-2 border-t border-neutral-200">
              <div className="flex items-center space-x-2 px-3 py-2 bg-warning-50 text-warning-700 text-sm font-medium rounded-lg border border-warning-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Local Development Mode</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Main Navigation component that chooses the appropriate version
const Navigation: React.FC = () => {
  return hasValidCognitoConfig ? <AuthenticatedNavigation /> : <UnauthenticatedNavigation />;
};

export default Navigation;

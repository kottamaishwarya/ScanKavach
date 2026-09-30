/**
 * @license
 * SPDX-License-Identifier: MIT
 * ProtectedRoute: Enforces client authentication session
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentSession } from '../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = getCurrentSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

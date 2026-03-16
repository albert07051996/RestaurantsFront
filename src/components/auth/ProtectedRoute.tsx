import React from 'react';
import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%)',
      }}>
        <p style={{ color: '#d4af37', fontSize: '1.5rem', fontFamily: "Georgia, serif" }}>
          იტვირთება...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-tr from-[#f5f8f7] via-[#fffbf5] to-[#f3f7fa]">
        <div className="text-teal-600 font-semibold animate-pulse text-lg tracking-wide">Unlocking Vault...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

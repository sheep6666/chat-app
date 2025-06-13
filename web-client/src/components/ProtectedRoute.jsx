import { Navigate } from "react-router";
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const currentUser = useSelector(state => state.auth.currentUser);
  return currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;

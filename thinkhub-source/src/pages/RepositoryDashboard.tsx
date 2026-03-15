import { Navigate } from "react-router-dom";

// Consolidated into /repositories — redirect for backward compatibility
const RepositoryDashboard = () => <Navigate to="/repositories" replace />;
export default RepositoryDashboard;

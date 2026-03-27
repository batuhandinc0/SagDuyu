import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/LandingPage';
import DoctorDashboard from '../pages/DoctorDashboard';
import PatientDashboard from '../pages/PatientDashboard';
import Login from '../pages/Login';

const PrivateRoute = ({ children, allowedRole }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route
                path="/doctor/*"
                element={
                    <PrivateRoute allowedRole="doctor">
                        <DoctorDashboard />
                    </PrivateRoute>
                }
            />

            <Route
                path="/patient/*"
                element={
                    <PrivateRoute allowedRole="patient">
                        <PatientDashboard />
                    </PrivateRoute>
                }
            />
        </Routes>
    );
};

export default AppRoutes;

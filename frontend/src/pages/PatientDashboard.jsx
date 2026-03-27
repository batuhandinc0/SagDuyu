import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import PatientHome from './patient/PatientHome';
import AIResults from './patient/AIResults';
import LabResults from './patient/LabResults';
import Settings from './patient/Settings';
import Appointments from './patient/Appointments';

const PatientDashboard = () => {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar role="patient" />
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                <Routes>
                    <Route path="/" element={<PatientHome />} />
                    <Route path="/ai-results" element={<AIResults />} />
                    <Route path="/lab-results" element={<LabResults />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </main>
        </div>
    );
};

export default PatientDashboard;

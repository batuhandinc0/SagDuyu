import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import DoctorHome from './doctor/DoctorHome';
import Patients from './doctor/Patients';
import AIAnalysis from './doctor/AIAnalysis';
import LabResults from './doctor/LabResults';
import Settings from './doctor/Settings';
import SmartCheckup from './doctor/SmartCheckup';
const DoctorDashboard = () => {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar role="doctor" />
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                <Routes>
                    <Route path="/" element={<DoctorHome />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/ai-analysis" element={<AIAnalysis />} />
                    <Route path="/lab-results" element={<LabResults />} />
                    <Route path="/lab-analysis" element={<SmartCheckup />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </main>
        </div>
    );
};

export default DoctorDashboard;

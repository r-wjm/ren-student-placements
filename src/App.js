import React, { useState, useEffect } from 'react';
import './styles/App.css';
import MainHeader from './components/MainHeader';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Placements from './pages/Placements';
import HQ from './pages/HQ';
import Logout from "./pages/Logout";
import pb from "./API/PocketBase";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
        </Router>
    );
}

function ProtectedRoutes() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null); 

    useEffect(() => {
       
        const checkAuth = () => {
            if (pb.authStore.isValid) {
                setIsAuthenticated(true);
                const user = pb.authStore.model; 
                setUserRole(user.role); 
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-container">
            <MainHeader />
            <div className="content-container">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to={userRole === "HQ" ? "/hq" : "/placements"} replace />} />
                        {userRole !== "HQ" && (
                            <>
                                <Route path="/placements" element={<Placements />} />
                            </>
                        )}
                        <Route path="/hq" element={<HQ />} />
                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default App;

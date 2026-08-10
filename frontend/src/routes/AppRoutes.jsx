import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import GitHub from "../pages/GitHub";
import Codeforces from "../pages/Codeforces";
import LeetCode from "../pages/LeetCode";
import Settings from "../pages/Settings";
import AppLayout from "../components/layout/AppLayout";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/github" element={<GitHub />} />
                <Route path="/codeforces" element={<Codeforces />} />
                <Route path="/leetcode" element={<LeetCode />} />
                <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default AppRoutes;
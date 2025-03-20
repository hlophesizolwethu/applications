import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/Dashboard";
import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

const App = () => {
    const [role, setRole] = useState<string>("");

    useEffect(() => {
        const fetchUser = async () => {
            // Fetch the authenticated user from Supabase
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error("Failed to fetch authenticated user:", authError);
                return;
            }

            // Fetch the user's role from the `users` table
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .single();

            if (userError || !userData) {
                console.error("Failed to fetch user role:", userError);
                return;
            }

            // Set the user's role
            setRole(userData.role);
        };

        fetchUser();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/admin-dashboard"
                    element={role === "admin" || role === "manager" ? <AdminDashboard /> : <Navigate to="/dashboard" />}
                />
                <Route
                    path="/dashboard"
                    element={role === "team_member" ? <MemberDashboard /> : <Navigate to="/admin-dashboard" />}
                />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;
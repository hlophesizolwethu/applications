import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/Dashboard";

const App = () => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);

            try {
                // Get authenticated user
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) {
                    console.warn("No authenticated user:", authError);
                    setRole(null);
                    setLoading(false);
                    return;
                }

                // Fetch role from Supabase `users` table
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (userError) {
                    console.error("Failed to fetch user role:", userError);
                    setRole(null);
                } else {
                    setRole(userData.role);
                }
            } catch (error) {
                console.error("Unexpected error fetching user role:", error);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        // Supabase auth listener to update role on login/logout
        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            fetchUser();
        });

        return () => {
            // Cleanup listener on component unmount
            authListener.subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Admin/Manager Route */}
                <Route
                    path="/admin-dashboard"
                    element={
                        role === "admin" || role === "manager"
                            ? <AdminDashboard />
                            : role === "team_member"
                                ? <Navigate to="/dashboard" />
                                : <Navigate to="/login" />
                    }
                />
                
                {/* Team Member Route */}
                <Route
                    path="/dashboard"
                    element={
                        role === "team_member"
                            ? <MemberDashboard />
                            : role === "admin" || role === "manager"
                                ? <Navigate to="/admin-dashboard" />
                                : <Navigate to="/login" />
                    }
                />

                {/* Catch-all Route */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;

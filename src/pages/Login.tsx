import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            // Authenticate the user with Supabase Auth
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                console.error("Login error:", authError);
                setError(authError.message || "Login failed. Please try again.");
                setLoading(false);
                return;
            }

            const user = data?.user;
            if (!user) {
                setError("User not found.");
                setLoading(false);
                return;
            }

            // Fetch the user's role from the `users` table
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("username, role")
                .eq("id", user.id)
                .single();

            if (userError || !userData) {
                setError("Failed to fetch user role.");
                console.error("User role fetch error:", userError);
                setLoading(false);
                return;
            }

            // Redirect to the appropriate dashboard based on the user's role
            if (userData.role === "admin" || userData.role === "manager") {
                navigate("/admin-dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("An unexpected error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6">Login</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                />
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-purple-700 text-white p-2 rounded hover:bg-purple-600 transition duration-300 disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
                <p className="mt-4 text-center">
                    Don't have an account?{" "}
                    <button onClick={() => navigate("/register")} className="text-purple-700 hover:text-purple-900">
                        Register here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;

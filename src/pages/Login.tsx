import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            // Authenticate user with Supabase
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

            if (authError) {
                setError(authError.message || "Invalid credentials. Please try again.");
                setLoading(false);
                return;
            }

            const user = data?.user;
            if (!user) {
                setError("User not found.");
                setLoading(false);
                return;
            }

            // Fetch the user's role
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("username, role")
                .eq("user_id", user.id) // Ensure your table uses `user_id`
                .single();

            if (userError || !userData) {
                setError("Failed to fetch user role. Please contact support.");
                console.error("User role fetch error:", userError);
                setLoading(false);
                return;
            }

            // Redirect based on role
            if (userData.role === "admin" || userData.role === "manager") {
                navigate("/admin-dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("An unexpected error occurred. Please try again.");
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
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>
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

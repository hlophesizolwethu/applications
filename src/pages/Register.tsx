import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState<"admin" | "manager" | "team_member">("team_member");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            // Sign up the user with Supabase Auth
            const { data: { user }, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            if (!user) {
                setError("User registration failed.");
                setLoading(false);
                return;
            }

            // Add the user to the `users` table
            const { error: userError } = await supabase
                .from("users")
                .insert([{ id: user.id, email, username, password, role }]);

            if (userError) {
                setError("Failed to save user details.");
                setLoading(false);
                return;
            }

            // Show a success message
            setMessage("Registration successful! Please check your email to confirm your account.");

            // Redirect to the login page after a short delay
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error) {
            setError("An error occurred during registration.");
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50 ">
            <div className="flex items-center justify-center h-screen">
                <div className="bg-white bg-opacity-75 p-8 rounded-lg shadow-lg w-96">
                    <h1 className="text-2xl font-bold mb-6">Register</h1>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {message && <p className="text-green-500 mb-4">{message}</p>}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as "admin" | "manager" | "team_member")}
                        className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="team_member">Team Member</option>
                    </select>
                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-700 to-blue-700 text-white p-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition duration-300 disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                    <p className="mt-4 text-center">
                        Already have an account?{" "}
                        <button onClick={() => navigate("/login")} className="text-purple-700 hover:text-purple-900">
                            Login here
                        </button>
                    </p>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Register;
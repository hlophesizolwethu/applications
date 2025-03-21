import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState<"admin" | "manager" | "team_member">("team_member");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!email || !password || !username) {
            toast.error("Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            // Sign up the user with Supabase Auth
            const {data, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                toast.error(authError.message);
                setLoading(false);
                return;
            }

            

            // Insert user details into the `users` table
            const { error: userError } = await supabase
                .from("users")
                .insert([{ id: data?.user?.id, email, username, role }]);

            if (userError) {
                toast.error("Failed to save user details. Please try again.");
                setLoading(false);
                return;
            }

            // Show success message
            toast.success("Registration successful! Please check your email to confirm your account.");

            // Redirect to login after a short delay
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-center h-screen">
                <div className="bg-white bg-opacity-75 p-8 rounded-lg shadow-lg w-96">
                    <h1 className="text-2xl font-bold mb-6">Register</h1>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as "admin" | "manager" | "team_member")}
                        disabled={loading}
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

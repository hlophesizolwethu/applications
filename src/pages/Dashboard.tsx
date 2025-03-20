import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { User, Task } from "../types";
import { toast, ToastContainer } from "react-toastify";
import { FaHourglassHalf } from "react-icons/fa"; 
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [progressUpdates, setProgressUpdates] = useState<{ [taskId: string]: number }>({});
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndTasks = async () => {
            setLoading(true); // Add this line
            try {
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

                if (!authUser || authError) {
                    navigate("/login");
                    return;
                }

                // Fetch additional user details (username and role) from the `users` table
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("username, role")
                    .eq("id", authUser.id)
                    .single();

                if (userError || !userData) {
                    console.error("Failed to fetch user details:", userError);
                    toast.error("Failed to fetch user details.");
                    return;
                }

                // Merge the Supabase user with the custom fields
                const user: User = {
                    ...authUser,
                    username: userData.username,
                    role: userData.role,
                };

                setUser(user);

                // Fetch tasks assigned to the current user
                const { data: tasks, error: tasksError } = await supabase
                    .from("tasks")
                    .select("*")
                    .eq("assignee", authUser.id);

                if (tasksError) {
                    console.error("Failed to fetch tasks:", tasksError);
                    toast.error("Failed to fetch tasks.");
                } else {
                    setTasks(tasks || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("An error occurred while fetching data.");
            } finally {
                setLoading(false); // Add this line
            }
        };
    
        fetchUserAndTasks();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <FaHourglassHalf className="animate-spin text-4xl text-purple-700" />
            </div>
        );
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const handleProgressUpdate = async (taskId: string) => {
        const progress = progressUpdates[taskId];
        if (progress === undefined || progress < 0 || progress > 100) {
            toast.error("Please enter a valid progress percentage (0-100).");
            return;
        }

        const { error } = await supabase
            .from("tasks")
            .update({ progress })
            .eq("id", taskId);

        if (error) {
            toast.error("Failed to update progress.");
            console.error(error);
        } else {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === taskId ? { ...task, progress } : task
                )
            );
            toast.success("Progress updated successfully!");
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-cover bg-center bg-no-repeat relative style={{ backgroundImage: `url('../Logo.jpg')` ">
            <ToastContainer />
            <nav className="bg-gradient-to-r from-blue-700 to-purple-700 text-white p-4 rounded-lg shadow-lg mb-6">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Verzibiz</h1>
                        <div className="flex items-center space-x-4">
                            <p className="text-sm">Welcome, {user.username} ({user.role})</p>
                            <button
                                onClick={handleLogout}
                                className="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition duration-300"
                            >
                                Logout
                            </button>
                        </div>
                </div>
            </nav>

            <div className="container mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Your Tasks</h2>
                    {tasks.length === 0 ? (
                        <p className="text-gray-500">No tasks assigned to you.</p>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 border rounded-lg hover:shadow-md transition duration-300"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-blue-700">{task.title}</h3>
                                            <p className="text-gray-600">{task.description}</p>
                                            <p className="text-sm text-gray-500">
                                                Due: {new Date(task.due_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Priority: {task.priority}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Progress: {task.progress || 0}%
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="Progress"
                                                value={progressUpdates[task.id] || ""}
                                                onChange={(e) =>
                                                    setProgressUpdates({
                                                        ...progressUpdates,
                                                        [task.id]: parseInt(e.target.value),
                                                    })
                                                }
                                                className="w-30 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => handleProgressUpdate(task.id)}
                                                className="bg-gradient-to-r from-blue-700 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition duration-300"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
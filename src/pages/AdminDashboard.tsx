import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { User, Task } from "../types";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { toast, ToastContainer } from "react-toastify";
import { FaHourglassHalf } from "react-icons/fa"; 
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assignee: "",
        dueDate: "",
        priority: "medium" as "low" | "medium" | "high",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editTaskId, setEditTaskId] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
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

                // Fetch all users
                const { data: users, error: usersError } = await supabase.from("users").select("*");
                if (usersError) {
                    console.error("Failed to fetch users:", usersError);
                    toast.error("Failed to fetch users.");
                } else {
                    setUsers(users || []);
                }

                // Fetch tasks
                const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*");
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

    const handleCreateTask = async () => {
        if (!user) return;

        // Ensure all required fields are filled
        if (!newTask.title || !newTask.dueDate || !newTask.assignee) {
            toast.error("Please fill all required fields.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from("tasks")
                .insert([{ 
                    title: newTask.title,
                    description: newTask.description,
                    assignee: newTask.assignee,
                    due_date: newTask.dueDate,
                    priority: newTask.priority,
                    created_by: user.id,
                }])
                .select();

            if (error) {
                console.error("Task creation error:", error);
                toast.error(`Failed to create task: ${error.message}`);
            } else {
                setTasks([...tasks, data[0]]);
                setNewTask({ title: "", description: "", assignee: "", dueDate: "", priority: "medium" });
                setShowTaskForm(false); // Hide the form after task creation
                toast.success("Task created successfully!");
            }
        } catch (error) {
            console.error("Task creation catch error:", error);
            toast.error("An unexpected error occurred.");
        }
    };

    const handleEditTask = async (taskId: string) => {
        const taskToEdit = tasks.find((task) => task.id === taskId);
        if (taskToEdit) {
            setNewTask({
                title: taskToEdit.title,
                description: taskToEdit.description,
                assignee: taskToEdit.assignee,
                dueDate: taskToEdit.due_date,
                priority: taskToEdit.priority,
            });
            setIsEditing(true);
            setEditTaskId(taskId);
            setShowTaskForm(true); // Show the form in edit mode
        }
    };

    const handleUpdateTask = async () => {
        if (!editTaskId) return;

        const { data, error } = await supabase
            .from("tasks")
            .update(newTask)
            .eq("id", editTaskId)
            .select();

        if (error) {
            toast.error("Failed to update task.");
            console.error(error);
        } else {
            const updatedTasks = tasks.map((task) =>
                task.id === editTaskId ? data[0] : task
            );
            setTasks(updatedTasks);
            setIsEditing(false);
            setEditTaskId(null);
            setNewTask({ title: "", description: "", assignee: "", dueDate: "", priority: "medium" });
            setShowTaskForm(false); // Hide the form after task update
            toast.success("Task updated successfully!");
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);
        if (error) {
            toast.error("Failed to delete task.");
            console.error(error);
        } else {
            setTasks(tasks.filter((task) => task.id !== taskId));
            toast.success("Task deleted successfully!");
        }
    };

    const handleCancel = () => {
        setShowTaskForm(false); // Hide the form
        setIsEditing(false); // Reset edit mode
        setNewTask({ title: "", description: "", assignee: "", dueDate: "", priority: "medium" }); // Clear the form
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-50 to-blue-50 p-6 ">
            <ToastContainer />
            <nav className="bg-gradient-to-r from-purple-700 to-blue-700 text-white p-4 rounded-b-lg shadow-lg mb-6">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <p className="text-sm">Welcome, {user.username} ({user.role})</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition duration-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto">
                {/* Create Task Button */}
                <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="w-full bg-gradient-to-r from-purple-700 to-blue-700 text-white p-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition duration-300 mb-6"
                >
                    {showTaskForm ? "Hide Task Form" : "Create Task"}
                </button>

                {/* Task Form */}
                {showTaskForm && (
                    <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg mb-6 w-full max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-4 text-purple-700">
                        {isEditing ? "Edit Task" : "Create Task"}
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Task Title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                            type="text"
                            placeholder="Task Description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <select
                            value={newTask.assignee}
                            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Select Assignee</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            placeholder="Due Date"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <select
                            value={newTask.priority}
                            onChange={(e) =>
                                setNewTask({
                                    ...newTask,
                                    priority: e.target.value as "low" | "medium" | "high",
                                })
                            }
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <div className="flex space-x-4">
                            <button
                                onClick={isEditing ? handleUpdateTask : handleCreateTask}
                                className="w-1/2 bg-gradient-to-r from-purple-700 to-blue-700 text-white p-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition duration-300"
                            >
                                {isEditing ? "Update Task" : "Create Task"}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="w-1/2 bg-gradient-to-r from-gray-500 to-gray-700 text-white p-2 rounded-lg hover:from-gray-600 hover:to-gray-800 transition duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
                )}

                {/* Task List */}
                <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">All Tasks</h2>
                    {tasks.length === 0 ? (
                        <p className="text-gray-500">No tasks found.</p>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 border rounded-lg hover:shadow-md transition duration-300"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-purple-700">{task.title}</h3>
                                            <p className="text-gray-600">{task.description}</p>
                                            <p className="text-sm text-gray-500">
                                                Due: {new Date(task.due_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Priority: {task.priority}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Assignee: {users.find((u) => u.id === task.assignee)?.username || "Unassigned"}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditTask(task.id)}
                                                className="text-purple-700 hover:text-purple-900"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <TrashIcon className="h-5 w-5" />
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

export default AdminDashboard;
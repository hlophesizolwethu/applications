export interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    status: "pending" | "in_progress" | "completed";
    priority: "low" | "medium" | "high";
    due_date: string;
    created_by: string;
    progress?: number; // Progress percentage (0-100), optional
}

export type User = {
    id: string;
    email?: string;
    username: string;
    role: "admin" | "manager" | "team_member";
};
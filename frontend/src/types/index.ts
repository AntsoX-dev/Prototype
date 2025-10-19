export interface Utilisateur {
    _id: string;
    email: string;
    name: string;
    created: Date; 
    isEmailVerified: boolean;
    updated: Date;
    profilePictureUrl?: string;
}

export interface AuthContextType {
    utilisateur: Utilisateur | null;
    setUtilisateur: (utilisateur: Utilisateur | null) => void;
}

export interface Workspace {
    _id: string;
    name: string;
    description?: string;
    owner: Utilisateur | string;
    color: string;
    members : {
        user: Utilisateur;
        role: 'admin' | 'member' |'owner' |'viewer';
        joinedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

// Types minimaux pour que tout compile correctement
export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export enum ProjectStatus {
  PLANNING = "Planning",
  IN_PROGRESS = "In Progress",
  ON_HOLD = "On Hold",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}
export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  workspace?: Workspace;
  startDate: Date;
  dueDate: Date;
  progress: number;
  tasks: Task[];
  members: {
    user: Utilisateur;
    role: "admin" | "member" | "owner" | "viewer";
  }[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

export interface Subtask {
  _id: string;
  title: string;
  completed?: boolean;
  createdAt: Date;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  _id: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project: Project;
  createdAt: Date | string;
  updatedAt: Date | string;
  isArchived: boolean;
  dueDate?: Date | string | null;
  priority?: TaskPriority;
  assignee?: Utilisateur | string;
  createdBy?: Utilisateur | string;
  assignees?: Utilisateur[];
  subtasks?: Subtask[];
  watchers?: Utilisateur[];
  attachments?: Attachment[];
}

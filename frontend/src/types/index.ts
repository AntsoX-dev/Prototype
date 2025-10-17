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
    created: Date;
    updated: Date;
}

// Types minimaux pour que tout compile correctement
export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Project {
  _id: string;
  title: string;
  workspace?: string;
}

export interface User {
  _id: string;
  name?: string;
  email?: string;
}

export interface Subtask {
  _id: string;
  title: string;
  completed?: boolean;
}

export interface Attachment {
  _id: string;
  fileUrl?: string;
  fileName?: string;
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
  assignee?: User | string;
  createdBy?: User | string;
  assignees?: User[];
  subtasks?: Subtask[];
  watchers?: User[];
  attachments?: Attachment[];
}

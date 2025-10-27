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
  members: {
    user: Utilisateur;
    role: 'admin' | 'member' | 'owner' | 'viewer';
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";
export enum ProjectMemberRole {
  MANAGER = "manager",
  CONTRIBUTOR = "contributor",
  VIEWER = "viewer",
}

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
    role: 'admin' | 'member' | 'owner' | 'viewer';
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

export interface MemberProps {
  _id: string;
  user: Utilisateur;
  role: 'admin' | 'member' | 'owner' | 'viewer';
  joinedAt: Date;
}

export type ResourceType =
  | "Task"
  | "Project"
  | "Workspace"
  | "Comment"
  | "User";

export type ActionType =
  | "created_task"
  | "updated_task"
  | "created_subtask"
  | "updated_subtask"
  | "completed_task"
  | "created_project"
  | "updated_project"
  | "completed_project"
  | "created_workspace"
  | "updated_workspace"
  | "added_comment"
  | "added_member"
  | "removed_member"
  | "joined_workspace"
  | "added_attachment";

export interface ActivityLog {
  _id: string;
  user: Utilisateur;
  action: ActionType;
  resourceType: ResourceType;
  resourceId: string;
  details: any;
  createdAt: Date;
}

export interface CommentReaction {
  emoji: string;
  user: Utilisateur;
}

export interface Comment {
  _id: string;
  author: Utilisateur;
  text: string;
  createdAt: Date;
  reactions?: CommentReaction[];
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
}

export interface StatsCardProps {
  totalProjects: number;
  totalTasks: number;
  totalProjectInProgress: number;
  totalTaskCompleted: number;
  totalTaskToDo: number;
  totalTaskInProgress: number;
}

export interface TaskTrendsData {
  name: string;
  completed: number;
  inProgress: number;
  todo: number;
}

export interface TaskPriorityData {
  name: string;
  value: number;
  color: string;
}

export interface ProjectStatusData {
  name: string;
  value: number;
  color: string;
}

export interface WorkspaceProductivityData {
  name: string;
  completed: number;
  total: number;
}
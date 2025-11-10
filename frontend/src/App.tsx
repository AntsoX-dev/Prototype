import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./authentification/SignIn";
import SignUp from "./authentification/SignUp";
import MdpOublie from "./authentification/MdpOublie";
import ResetPassword from "./authentification/reset-password";
import VerifyEmail from "./authentification/verify-email";
import DashboardLayout from "./dashboard/dashboard-layout";
import Dashboard from "./dashboard/index";
import MyTasks from "./dashboard/my-tasks";
import Workspaces from "./dashboard/workspaces";
import WorkspaceDetails from "./dashboard/workspaces/workspace-details";
import ProjectDetails from "./dashboard/project/project-details";
import TaskDetails from "./dashboard/task/task-details";
import Members from "./dashboard/members";
import WorkspaceInvite from "./dashboard/workspaces/workspace-invite";
import UserLayout from "./user/user-layout";
import UserProfile from "./user/profile";
import LandingPage from './components/LandingPage'; // Assurez-vous que le chemin d'importation est correct

function App() {
  return (
    <Routes>
      {/* Route pour la LandingPage */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/mdpoublie" element={<MdpOublie />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="my-tasks" element={<MyTasks />} />
        <Route path="workspaces" element={<Workspaces />} />
        <Route path="workspaces/:workspaceId" element={<WorkspaceDetails />} />
        <Route path="workspaces/:workspaceId/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/dashboard/workspaces/:workspaceId/projects/:projectId/tasks/:taskId" element={<TaskDetails />} />
        <Route path="/dashboard/members" element={<Members />} />
      </Route>

      <Route path="/workspace-invite/:workspaceId" element={<WorkspaceInvite />} />

      {/* User routes */}
      <Route path="/user" element={<UserLayout />}>
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./authentification/SignIn";
import SignUp from "./authentification/SignUp";
import MdpOublie from "./authentification/MdpOublie";
import ResetPassword from "./authentification/reset-password";
import VerifyEmail from "./authentification/verify-email";
import DashboardLayout from "./dashboard/dashboard-layout";
import Dashboard from "./dashboard/index";
import MyTasks from "./dashboard/my-tasks";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/mdpoublie" element={<MdpOublie />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="my-tasks" element={<MyTasks />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import './index.css';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";    
import { NotificationProvider } from "./contexts/NotificationContext";
import Login from "./Authentication/login";
import Dashboard from "./Dashboard/Dashboard";
import Layout from "./Components/Layout";
import Tasks from "./Pages/Tasks";
import Team from "./Pages/Team";
import Reports from "./Pages/Reports";
import Settings from "./Pages/Settings";


function App() {
  return (
    <>
      <video autoPlay loop muted playsInline className="layout-video-bg">
        <source src="/my-space-video.mp4" type="video/mp4" />
      </video>
      <NotificationProvider>
        <BrowserRouter>
          <div className="page-transition">
            <Routes>
              <Route path="/" element={<Login />} />

              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/team" element={<Team />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Dashboard />} />
              </Route>
            </Routes>
          </div>
          <Toaster position="top-center" reverseOrder={false} toastOptions={{ maxCount: 1, style: { background: 'rgba(15,23,42,0.8)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' } }} />
        </BrowserRouter>
      </NotificationProvider>
    </>
  );
}

export default App;
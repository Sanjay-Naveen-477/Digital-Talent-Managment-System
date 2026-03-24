

import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Authentication/login";
import Dashboard from "./Dashboard/Dashboard";
import Layout from "./Components/Layout";
import Tasks from "./Pages/Tasks";
import Team from "./Pages/Team";
import Reports from "./Pages/Reports";
import Settings from "./Pages/Settings";


function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
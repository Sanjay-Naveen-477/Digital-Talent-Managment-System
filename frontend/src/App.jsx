import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "././Authentication/login";

function Admin() {
  return <h1>Admin Dashboard 🔐</h1>;
}

function User() {
  return <h1>User Dashboard 👤</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/login", {
        email,
        password,
      });

      if (res.data.status === "success") {
        if (res.data.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/user";
        }
      } else {
        alert("Invalid login");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/home";

  useEffect(() => {

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      navigate(from, { replace: true });
    }
  }, [navigate, from, setUser]);

  const handleLogin = (e) => {
    e.preventDefault();

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = storedUsers.find(
      (user) =>
        user.email.toLowerCase() === inputEmail &&
        String(user.password) === inputPassword
    );

    if (foundUser) {
      localStorage.setItem("user", JSON.stringify(foundUser));
      setUser(foundUser);
      navigate(from, { replace: true });
    } else {
      setError("Email o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit">Iniciar sesión</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Home from "./pages/Home";
import Entries from "./pages/Entries";
import Billing from "./pages/Billing";
import Users from "./pages/Users";
import RoleManagement from "./pages/RoleManagement";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  const checkAccess = (route) => {
    const storedRoles = JSON.parse(localStorage.getItem("roles"));
    if (!user || !storedRoles) return false;

    const userRole = storedRoles.find((role) => role.id === user.roleId);
    if (!userRole) return false;

    return userRole.accessibleRoutes.includes(route);
  };

  return (
    <Router>
      {user && <Sidebar handleLogout={() => handleLogout(setUser)} />}
      <div className={user ? "main-content" : "login-only"}>
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route
            path="/home"
            element={user ? <Home /> : <Navigate to="/" />}
          />
          <Route
            path="/products"
            element={
              user && checkAccess("/products") ? (
                <Products />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/clients"
            element={
              user && checkAccess("/clients") ? (
                <Clients />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/categories"
            element={
              user && checkAccess("/categories") ? (
                <Categories />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/suppliers"
            element={
              user && checkAccess("/suppliers") ? (
                <Suppliers />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/entries"
            element={
              user && checkAccess("/entries") ? (
                <Entries />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/salidas"
            element={
              user && checkAccess("/salidas") ? (
                <Billing />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/usuarios"
            element={
              user && checkAccess("/usuarios") ? (
                <Users />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          {/* Ruta de administración de roles */}
          <Route
            path="/roles"
            element={
              user && checkAccess("/roles") ? (
                <RoleManagement />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="*" element={<Navigate to={user ? "/home" : "/"} />} />
        </Routes>
      </div>
    </Router>
  );
}

const handleLogout = (setUser) => {
  localStorage.removeItem("user");
  setUser(null);
};

export default App;
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Box,
  Truck,
  Package,
  BarChart2,
  Download,
  Upload,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";
import logo from "../../public/control.png";

function Sidebar({ handleLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("");
  const [accessibleRoutes, setAccessibleRoutes] = useState([]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSubMenu = (menu) => setActiveMenu(activeMenu === menu ? "" : menu);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedRoles = JSON.parse(localStorage.getItem("roles"));

    if (storedUser && storedRoles) {
      const userRole = storedRoles.find((role) => role.id === storedUser.roleId);
      if (userRole) {
        setAccessibleRoutes(userRole.accessibleRoutes || []);
      }
    }
  }, []);

  const menuItems = [
    { path: "/home", label: "Inicio", icon: <Home size={18} />, group: null },
    { path: "/clients", label: "Clientes", icon: <Users size={18} />, group: null },
    { path: "/categories", label: "Categorías", icon: <Package size={16} />, group: "products" },
    { path: "/products", label: "Productos", icon: <Box size={16} />, group: "products" },
    { path: "/suppliers", label: "Proveedores", icon: <Truck size={16} />, group: "products" },
    { path: "/entries", label: "Entradas", icon: <Download size={16} />, group: "stock" },
    { path: "/salidas", label: "Salidas", icon: <Upload size={16} />, group: "stock" },
    { path: "/usuarios", label: "Usuarios", icon: <User size={16} />, group: "users" },
    { path: "/roles", label: "Roles", icon: <Settings size={16} />, group: "users" },
  ];

  const filteredItems = menuItems.filter((item) => accessibleRoutes.includes(item.path));

  const renderGroup = (groupName, label, icon) => {
    const groupItems = filteredItems.filter((item) => item.group === groupName);
    if (groupItems.length === 0) return null;

    return (
      <li>
        <button onClick={() => toggleSubMenu(groupName)} className="submenu-toggle">
          {icon}
          {label}
        </button>
        {activeMenu === groupName && (
          <ul className="submenu">
            {groupItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => (isActive ? "active-link" : "")}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", isOpen);
    document.body.classList.toggle("sidebar-closed", !isOpen);
  }, [isOpen]);

  return (
    <>
      <button
        className={`toggle-button ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
        style={{ left: isOpen ? "250px" : "10px" }}
      >
        {isOpen ? "✖" : "☰"}
      </button>

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="logo-container">
          <img src={logo} alt="Logo" />
        </div>

        <nav>
          <ul>
            {filteredItems.filter((i) => !i.group).map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} className={({ isActive }) => (isActive ? "active-link" : "")}>
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}

            {renderGroup("products", "Gestión de Productos", <Box size={18} style={{ marginRight: "8px" }} />)}
            {renderGroup("stock", "Gestión de Existencias", <BarChart2 size={18} style={{ marginRight: "8px" }} />)}
            {renderGroup("users", "Gestión de Usuarios", <Settings size={18} style={{ marginRight: "8px" }} />)}

            <li>
              <button className="logout-button" onClick={handleLogout}>
                <LogOut size={18} style={{ marginRight: "8px" }} />
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;
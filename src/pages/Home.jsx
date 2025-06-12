import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsersCog } from "react-icons/fa"; 

import {
  FaBoxOpen,
  FaUsers,
  FaFolderOpen,
  FaTruckMoving,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";
import "./Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [accessibleRoutes, setAccessibleRoutes] = useState([]);
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();

  const routeCards = [
    {
      route: "/products",
      label: "Productos",
      icon: <FaBoxOpen />,
      color: "#3B7A57",
      key: "products",
    },
    {
      route: "/clients",
      label: "Clientes",
      icon: <FaUsers />,
      color: "#336699",
      key: "clients",
    },
    {
      route: "/categories",
      label: "Categorías",
      icon: <FaFolderOpen />,
      color: "#D4A017",
      key: "categories",
    },
    {
      route: "/suppliers",
      label: "Proveedores",
      icon: <FaTruckMoving />,
      color: "#7E57C2",
      key: "suppliers",
    },
    {
      route: "/entries",
      label: "Entradas",
      icon: <FaSignInAlt />,
      color: "#3EB489",
      key: "entries",
    },
    {
      route: "/salidas",
      label: "Salidas",
      icon: <FaSignOutAlt />,
      color: "#FF6F61",
      key: "salidas",
    },
    {
      route: "/usuarios",
      label: "Usuarios",
      icon: <FaUserShield />,
      color: "#5D6D7E",
      key: "usuarios",
    },
    {
      route: "/roles",
      label: "Roles",
      icon: <FaUsersCog />, 
      color: "#FFB74D",  
      key: "roles",
    },
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedRoles = JSON.parse(localStorage.getItem("roles"));

    if (storedUser && storedRoles) {
      setUser(storedUser);
      const userRole = storedRoles.find((role) => role.id === storedUser.roleId);
      if (userRole) {
        setAccessibleRoutes(userRole.accessibleRoutes);
      }
    }

    const keys = [
      "products",
      "clients",
      "categories",
      "suppliers",
      "entries",
      "salidas",
      "usuarios",
    ];

    const tempCounts = {};

    keys.forEach((key) => {
      const data = JSON.parse(localStorage.getItem(key)) || [];
      console.log(`Data for ${key}:`, data);
      tempCounts[key] = data.length > 0 ? data.length : 0;
    });

    setCounts(tempCounts);
  }, []);

  return (
    <div className="main-content home-container">
      <h1>Bienvenido{user ? `, ${user.firstName} ${user.lastName}` : ""}</h1>

      <div className="cards-container">
        {routeCards
          .filter((card) => accessibleRoutes.includes(card.route))
          .map((card) => (
            <div
              key={card.route}
              className="home-card"
              style={{ backgroundColor: card.color }}
              onClick={() => navigate(card.route)}
            >
              <div className="icon">{card.icon}</div>
              <div className="label">{card.label}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Home;

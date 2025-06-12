import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header({ onLogout }) {
  return (
    <header className="header">
      <h1>Gestión de Inventario</h1>
      <nav>
      <Link to="/clients">Clientes</Link>
        <Link to="/products">Productos</Link>
       
        <button onClick={onLogout}>Cerrar sesión</button>
      </nav>
    </header>
  );
}

export default Header;

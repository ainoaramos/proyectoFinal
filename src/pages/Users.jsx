import React, { useState, useEffect } from "react";
import "./Users.css";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";




function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleId: "",
    createdAt: "",
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users"));
    const storedRoles = JSON.parse(localStorage.getItem("roles"));

    if (storedUsers?.length && storedRoles?.length) {
      setUsers(storedUsers);
      setRoles(storedRoles);
    } else {
      fetch("/data.json")
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data.users)) {
            setUsers(data.users);
            localStorage.setItem("users", JSON.stringify(data.users));
          }
          if (Array.isArray(data.roles)) {
            setRoles(data.roles);
            localStorage.setItem("roles", JSON.stringify(data.roles));
          }
        })
        .catch((error) =>
          console.error("Error cargando usuarios o roles:", error)
        );
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "roleId" ? Number(value) : value;
    setNewUser({ ...newUser, [name]: parsedValue });
  };

  const getRoleName = (roleId) => {
    const role = roles.find((rol) => rol.id === Number(roleId));
    return role ? role.name : "N/A";
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setNewUser(user);
    } else {
      setEditingUser(null);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roleId: "",
        createdAt: new Date().toISOString().split("T")[0],
      });
    }
    setShowPassword(false); 
    setModalIsOpen(true);
  };

  const handleSaveUser = () => {
    const password = String(newUser.password).trim();
    const email = newUser.email.trim().toLowerCase();
  
    if (
      !newUser.firstName.trim() ||
      !newUser.lastName.trim() ||
      !email ||
      !password ||
      !newUser.roleId
    ) {
      alert("Por favor, completa todos los campos.");
      return;
    }
  
    const emailExistente = users.find(
      (u) =>
        u.email.toLowerCase() === email &&
        (!editingUser || u.id !== editingUser.id)
    );
    if (emailExistente) {
      alert("Ya existe un usuario con este email.");
      return;
    }
  
    let updatedUsers;
    const currentUser = JSON.parse(localStorage.getItem("user"));
  
    if (editingUser) {
      
      const updatedUser = {
        ...editingUser,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password, 
        roleId: newUser.roleId,
        createdAt: newUser.createdAt, 
      };
  
      updatedUsers = users.map((u) =>
        u.id === editingUser.id ? updatedUser : u
      );
  
      if (currentUser?.id === updatedUser.id) {
        localStorage.setItem("user", JSON.stringify(updatedUser)); 
      }
    } else {
      const newUserId = users.length
        ? Math.max(...users.map((u) => u.id)) + 1
        : 1;
  
      const userToSave = {
        ...newUser,
        id: newUserId,
        email,
        password,
        createdAt: new Date().toISOString().split("T")[0],
      };
  
      updatedUsers = [...users, userToSave];
      localStorage.setItem("user", JSON.stringify(userToSave));
    }
  
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setModalIsOpen(false);
  };
  

  const handleDeleteUser = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="users-container">
      <h2>Lista de Usuarios</h2>

      <input
        type="text"
        placeholder="Buscar usuario..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <button className="add-button" onClick={() => openModal()}>
        Agregar Usuario
      </button>

      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha de Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
        <tr key={user.id}>
        <td data-label="Nombre">
          {user.firstName} {user.lastName}
        </td>
        <td data-label="Email">{user.email}</td>
        <td data-label="Rol">{getRoleName(user.roleId)}</td>
        <td data-label="Fecha">{user.createdAt}</td>
        <td data-label="Acciones">
          <button
                className="edit-button"
                onClick={() => openModal(user)}
                title="Editar usuario"
              >
                <Edit size={18} />
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteUser(user.id)}
                title="Eliminar usuario"
              >
                <Trash2 size={18} />
              </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalIsOpen && (
  <div className="modal-overlay" onClick={() => setModalIsOpen(false)}>
    <div
      className="modal"
      onClick={(e) => e.stopPropagation()} 
    >
      <div>
        <h2>{editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}</h2>
        <button
          className="close-button"
          onClick={() => setModalIsOpen(false)}
          aria-label="Cerrar modal"
        >
          &times;
        </button>
      </div>
      <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="firstName"
          placeholder="Nombre"
          value={newUser.firstName}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Apellido"
          value={newUser.lastName}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          autoComplete="new-email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleInputChange}
        />
<div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    autoComplete="new-password"
    placeholder="Contraseña"
    value={newUser.password}
    onChange={handleInputChange}
  />
  <button
    type="button"
    className="toggle-password"
    onClick={() => setShowPassword((show) => !show)}
    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
  >
   {showPassword ? <EyeOff size={18} color="#FFFFFF" /> : <Eye size={18} color="#FFFFFF" />}

  </button>
</div>


        <select
          name="roleId"
          value={newUser.roleId}
          onChange={handleInputChange}
        >
          <option value="">Selecciona un rol</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {editingUser && (
          <input
            type="text"
            name="createdAt"
            placeholder="Fecha de Creación"
            value={newUser.createdAt}
            disabled
          />
        )}
        <button type="button" className="primary" onClick={handleSaveUser}>
          {editingUser ? "Actualizar" : "Guardar"}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => setModalIsOpen(false)}
        >
          Cancelar
        </button>
      </form>
    </div>
  </div>
)}

    </div>
  );
}

export default Users;

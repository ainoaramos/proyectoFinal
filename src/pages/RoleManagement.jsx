import React, { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import './RoleManagement.css';  // Importa el CSS

const RolesList = () => {
  const routes = [
    { path: "/home", name: "Home" },
    { path: "/products", name: "Productos" },
    { path: "/clients", name: "Clientes" },
    { path: "/categories", name: "Categorías" },
    { path: "/suppliers", name: "Proveedores" },
    { path: "/entries", name: "Entradas" },
    { path: "/salidas", name: "Facturación" },
    { path: "/usuarios", name: "Usuarios" },
    { path: "/roles", name: "Roles" },
  ];

  const routeMap = Object.fromEntries(routes.map(route => [route.path, route.name]));

  const loadRolesFromLocalStorage = () => {
    const storedRoles = localStorage.getItem('roles');
    if (storedRoles) {
      return JSON.parse(storedRoles);
    } else {
      return [];
    }
  };

  const [roles, setRoles] = useState(loadRolesFromLocalStorage);
  const [newRole, setNewRole] = useState({ id: "", name: "", accessibleRoutes: ["/home"] });
  const [editMode, setEditMode] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    if (roles.length === 0) {
      fetch("/data.json")
        .then((response) => response.json())
        .then((data) => {
          if (data.roles && Array.isArray(data.roles)) {
            setRoles(data.roles);
            localStorage.setItem("roles", JSON.stringify(data.roles));
          } else {
            console.error("Error: `data.json` no tiene un array de `roles`.");
          }
        })
        .catch((error) => console.error("Error cargando roles:", error));
    }
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('roles', JSON.stringify(roles));
  }, [roles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRole({ ...newRole, [name]: value });
  };

  const handleRouteChange = (e) => {
    const route = e.target.value;
    const isChecked = e.target.checked;

    if (route === "/home") {
      return;
    }

    setNewRole((prevState) => {
      const updatedRoutes = isChecked
        ? [...prevState.accessibleRoutes, route]
        : prevState.accessibleRoutes.filter(r => r !== route);
      return { ...prevState, accessibleRoutes: updatedRoutes };
    });
  };

 const handleAddRole = () => {
    const accessibleRoutesWithHome = newRole.accessibleRoutes.includes("/home") 
      ? newRole.accessibleRoutes 
      : ["/home", ...newRole.accessibleRoutes];

    const newId = roles.length ? roles[roles.length - 1].id + 1 : 1;
    const newRoleData = { ...newRole, id: newId, accessibleRoutes: accessibleRoutesWithHome };
    setRoles([...roles, newRoleData]);
    setNewRole({ id: "", name: "", accessibleRoutes: ["/home"] });
    setModalIsOpen(false);
  };

  const handleDeleteRole = (id) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  const handleEditRole = (id) => {
    const roleToEdit = roles.find(role => role.id === id);
    const accessibleRoutesWithHome = roleToEdit.accessibleRoutes && !roleToEdit.accessibleRoutes.includes("/home")
      ? ["/home", ...roleToEdit.accessibleRoutes]
      : roleToEdit.accessibleRoutes || ["/home"];
    setNewRole({ id: roleToEdit.id, name: roleToEdit.name, accessibleRoutes: accessibleRoutesWithHome });
    setEditMode(true);
    setCurrentRoleId(id);
    setModalIsOpen(true);
  };

  const handleUpdateRole = () => {
    setRoles(roles.map(role =>
      role.id === currentRoleId ? { ...role, name: newRole.name, accessibleRoutes: newRole.accessibleRoutes } : role
    ));
    setNewRole({ id: "", name: "", accessibleRoutes: [] });
    setEditMode(false);
    setCurrentRoleId(null);
    setModalIsOpen(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setNewRole({ id: "", name: "", accessibleRoutes: [] });
    setEditMode(false);
  };

  return (
    <div className="roles-container">
      <h2>Lista de Roles</h2>

      <button className="add-button" onClick={() => setModalIsOpen(true)}>Agregar Rol</button>

      <table className="role-table">
        <thead>
          <tr>
            <th>ID de Rol</th>
            <th>Nombre del Rol</th>
            <th>Rutas Accesibles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr  key={role.id}>
              <td>{role.id}</td>
              <td data-label="Nombre">{role.name}</td>
         
              <td data-label="Rol">
                {Array.isArray(role.accessibleRoutes) && role.accessibleRoutes.length > 0
                  ? role.accessibleRoutes.map(routePath => routeMap[routePath] || routePath).join(", ")
                  : "No hay rutas"}
              </td>
              <td data-label="Acciones">
                <button className="edit-button" onClick={() => handleEditRole(role.id)} title="Editar Rol">
                  <Edit size={18} />
                </button>
                <button className="delete-button" onClick={() => handleDeleteRole(role.id)} title="Eliminar Rol">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalIsOpen && (
        <div className="modalRol-overlay">
          <div className="modalRol">
            <div>
              <h2>{editMode ? "Editar Rol" : "Crear Rol"}</h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>

            <input
              type="text"
              name="name"
              value={newRole.name}
              onChange={handleInputChange}
              placeholder="Nombre del Rol"
            />

            <div>
              <h3>Acceso a Rutas:</h3>
              {routes.map(route => (
              <label key={route.path} className="checkbox-wrapper">
                {route.name}
                <input
                  type="checkbox"
                  value={route.path}
                  checked={route.path === "/home" ? true : newRole.accessibleRoutes.includes(route.path)}
                  onChange={route.path === "/home" ? undefined : handleRouteChange}
                  disabled={route.path === "/home"}
                />
              </label>
            ))}
            </div>

            <div style={{ marginTop: "10px" }}>
              {editMode ? (
                <button className="primary" onClick={handleUpdateRole}>Actualizar Rol</button>
              ) : (
                <button className="primary" onClick={handleAddRole}>Agregar Rol</button>
              )}
              <button className="secondary" onClick={closeModal} style={{ marginLeft: "10px" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesList;

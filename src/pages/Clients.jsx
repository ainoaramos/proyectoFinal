import React, { useEffect, useState } from "react";
import { PlusCircle, Edit, Trash2, Eye, X } from "lucide-react";
import "./Clients.css";
import * as Yup from 'yup';

function Clients() {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    dni: "",
    street: "",
    postalCode: "",
    city: ""
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [errorMessages, setErrorMessages] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    dni: "",
    street: "",
    postalCode: "",
    city: ""
  });

  useEffect(() => {
    const stored = localStorage.getItem("clients");
    if (stored) {
      setClients(JSON.parse(stored));
    } else {
      fetch("/data.json")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data.clients)) {
            setClients(data.clients);
            localStorage.setItem("clients", JSON.stringify(data.clients));
          }
        });
    }
  }, []);

  const handleInputChange = e => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const handleSaveClient = async () => {
    const clientSchema = Yup.object().shape({
      name: Yup.string().trim().required('El nombre es obligatorio.'),
      surname: Yup.string().trim().required('El apellido es obligatorio.'),
      email: Yup.string().trim().email('Email inválido.').required('El email es obligatorio.'),
      street: Yup.string().trim().required('La dirección es obligatoria.'),
      city: Yup.string().trim().required('La ciudad es obligatoria.'),
      phone: Yup.string().matches(/^\d{9}$/, 'Teléfono inválido (9 dígitos).').required('El teléfono es obligatorio.'),
      dni: Yup.string().trim().required('El DNI es obligatorio.'),
     
      postalCode: Yup.string().matches(/^\d{5}$/, 'Código postal de 5 dígitos.').required('El código postal es obligatorio.'),
     
    });
  
    try {
      await clientSchema.validate(newClient, { abortEarly: false });
      setErrorMessages({});

      let updated;
      if (editingClient) {
        updated = clients.map(c => c.id === editingClient.id
          ? { ...newClient, id: c.id }
          : c
        );
      } else {
        updated = [...clients, { ...newClient, id: clients.length + 1 }];
      }
      setClients(updated);
      localStorage.setItem("clients", JSON.stringify(updated));
      setModalIsOpen(false);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const msgs = {};
        err.inner.forEach(e => {
          msgs[e.path] = e.message;
        });
        setErrorMessages(msgs);
      }
    }
  };
  

  const openModal = client => {
    if (client) {
      setEditingClient(client);
      setNewClient(client);
    } else {
      setEditingClient(null);
      setNewClient({
        name: "",
        surname: "",
        email: "",
        phone: "",
        dni: "",
        street: "",
        postalCode: "",
        city: ""
      });
    }
    setModalIsOpen(true);
  };

  const openShowClientModal = client => {
    setViewingClient(client);
  };

  const handleDeleteClient = id => {
    if (window.confirm("¿Eliminar este cliente?")) {

      const sales = JSON.parse(localStorage.getItem("salidas")) || [];
      console.log("Salidas antes de filtrar:", sales);

      const filteredSales = sales.filter(sale => sale.clientId !== id);
      console.log("Salidas después de filtrar:", filteredSales);

      localStorage.setItem("salidas", JSON.stringify(filteredSales));

      const updatedClients = clients.filter(client => client.id !== id);
      console.log("Clientes después de eliminar:", updatedClients);

      setClients(updatedClients);
      localStorage.setItem("clients", JSON.stringify(updatedClients));
    }
  };
  
  
  
  

  return (
    <div className="clients-container">
      <h2>Lista de Clientes</h2>

      <button className="add-button" onClick={() => openModal()}>
        <PlusCircle size={18} style={{ marginRight: 6 }} />
        Agregar Cliente
      </button>

      <table className="client-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
        {clients.map(client => (
          <tr key={client.id}>
            <td data-label="Nombre">{client.name} {client.surname}</td>
            <td data-label="Email">{client.email}</td>
            <td data-label="Telefono">{client.phone}</td>
            <td data-label="Acciones">
              <button className="edit-button" onClick={() => openModal(client)}>
                <Edit size={16} />
              </button>
              <button className="delete-button" onClick={() => handleDeleteClient(client.id)}>
                <Trash2 size={16} />
              </button>
              <button className="view-button" onClick={() => openShowClientModal(client)}>
                <Eye size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>

      </table>

      {modalIsOpen && (
        <div className="modal-overlay" onClick={() => setModalIsOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div>
              <h2>{editingClient ? "Editar Cliente" : "Agregar Nuevo Cliente"}</h2>
              <button className="close-button" onClick={() => setModalIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {["name","surname","email","phone","dni","street","postalCode","city"].map(field => (
              <React.Fragment key={field}>
                <input
                  name={field}
                  type={field === "email" ? "email" : "text"}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={newClient[field]}
                  onChange={handleInputChange}
                />
                {errorMessages[field] && <span className="error">{errorMessages[field]}</span>}
              </React.Fragment>
            ))}

            <div style={{ marginTop: 12 }}>
              <button className="primary" onClick={handleSaveClient}>
                {editingClient ? "Actualizar" : "Guardar"}
              </button>
              <button className="secondary" onClick={() => setModalIsOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

{viewingClient && (
  <div
    className="modal-overlay"
    onClick={() => setViewingClient(null)}
  >
    <div
      className="modal"
      onClick={e => e.stopPropagation()}
    >
     
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>Detalles del Cliente</h2>
        <button
          className="close-button"
          onClick={() => setViewingClient(null)}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      {Object.entries(viewingClient).map(([key, val]) =>
        key !== "id" && (
          <p key={key}>
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {val}
          </p>
        )
      )}

      
      <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
        <button
          className="secondary"
          onClick={() => setViewingClient(null)}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Clients;

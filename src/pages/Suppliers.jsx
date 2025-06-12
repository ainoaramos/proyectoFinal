import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { PlusCircle, Edit, Trash2, X } from "lucide-react";
import "./Suppliers.css";
import * as Yup from "yup";

Modal.setAppElement("#root");

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({ name: "", email: "", phone: "" });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState({});


const supplierSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre es obligatorio"),
  email: Yup.string()
    .email("Debe ser un email válido")
    .required("El email es obligatorio"),
  phone: Yup.string()
    .matches(/^[0-9\s()+-]+$/, "El teléfono solo debe contener números y símbolos válidos")
    .required("El teléfono es obligatorio"),
});

  useEffect(() => {
    const stored = localStorage.getItem("suppliers");
    if (stored) {
      setSuppliers(JSON.parse(stored));
    } else {
      fetch("/data.json")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.suppliers)) {
            setSuppliers(data.suppliers);
            localStorage.setItem("suppliers", JSON.stringify(data.suppliers));
          }
        })
        .catch(err => console.error("Error cargando proveedores:", err));
    }
  }, []);

  const handleInputChange = e => {
    setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
  };

  const openModal = supplier => {
    if (supplier) {
      setEditingSupplier(supplier);
      setNewSupplier(supplier);
    } else {
      setEditingSupplier(null);
      setNewSupplier({ name: "", email: "", phone: "" });
    }
    setModalIsOpen(true);
  };

  // const handleSaveSupplier = () => {
  //   if (!newSupplier.name.trim() || !newSupplier.email.trim() || !newSupplier.phone.trim()) {
  //     alert("Por favor, completa todos los campos.");
  //     return;
  //   }
  //   let updated = editingSupplier
  //     ? suppliers.map(s => s.id === editingSupplier.id ? { ...newSupplier, id: s.id } : s)
  //     : [...suppliers, { ...newSupplier, id: suppliers.length + 1 }];
  //   setSuppliers(updated);
  //   localStorage.setItem("suppliers", JSON.stringify(updated));
  //   setModalIsOpen(false);
  // };

  const handleSaveSupplier = async () => {
    try {
      await supplierSchema.validate(newSupplier, { abortEarly: false });
  
      let updated = editingSupplier
        ? suppliers.map(s =>
            s.id === editingSupplier.id ? { ...newSupplier, id: s.id } : s
          )
        : [...suppliers, { ...newSupplier, id: suppliers.length + 1 }];
  
      setSuppliers(updated);
      localStorage.setItem("suppliers", JSON.stringify(updated));
      setModalIsOpen(false);
    } catch (validationError) {
      if (validationError.inner) {
        const messages = validationError.inner.reduce((acc, err) => {
          acc[err.path] = err.message;
          return acc;
        }, {});
        setValidationErrors(messages); // Nuevo estado que manejaremos abajo
      }
    }
  };
  

  const handleDeleteSupplier = id => {
    if (window.confirm("¿Estás seguro de eliminar este proveedor?")) {
      let updated = suppliers.filter(s => s.id !== id);
      setSuppliers(updated);
      localStorage.setItem("suppliers", JSON.stringify(updated));
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="suppliers-container">
      <h2>Lista de Proveedores</h2>

      <input
        type="text"
        placeholder="Buscar proveedor..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <button className="add-button" onClick={() => openModal()}>
        <PlusCircle size={18} style={{ marginRight: 6 }} />
        Agregar Proveedor
      </button>

      <table className="supplier-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(supplier => (
            <tr key={supplier.id}>
              <td data-label="Nombre">{supplier.name}</td>
              <td data-label="Email">{supplier.email}</td>
              <td data-label="Teléfono">{supplier.phone}</td>
              <td data-label="Acciones">
                <button className="edit-button" onClick={() => openModal(supplier)}>
                  <Edit size={16} />
                </button>
                <button className="delete-button" onClick={() => handleDeleteSupplier(supplier.id)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        overlayClassName="modalProveedor-overlay"
        className="modalProveedor"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{editingSupplier ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}</h2>
          <button className="close-button" onClick={() => setModalIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={newSupplier.name}
          onChange={handleInputChange}
        />
        {validationErrors.name && <p className="error">{validationErrors.name}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newSupplier.email}
          onChange={handleInputChange}
        />
        {validationErrors.email && <p className="error">{validationErrors.email}</p>}

        <input
          type="text"
          name="phone"
          placeholder="Teléfono"
          value={newSupplier.phone}
          onChange={handleInputChange}
        />
        {validationErrors.phone && <p className="error">{validationErrors.phone}</p>}

        <div style={{ marginTop: 12 }}>
          <button className="primary" onClick={handleSaveSupplier}>
            {editingSupplier ? "Actualizar" : "Guardar"}
          </button>
          <button className="secondary" onClick={() => setModalIsOpen(false)}>
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Suppliers;

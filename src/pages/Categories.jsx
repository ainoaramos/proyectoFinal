import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import "./Categories.css";
import * as Yup from 'yup';

Modal.setAppElement("#root");

function Categories() {
  const [categories, setCategories] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [errorMessages, setErrorMessages] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("categories");
    if (stored) {
      setCategories(JSON.parse(stored));
    } else {
      fetch("/data.json")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.categories)) {
            setCategories(data.categories);
            localStorage.setItem("categories", JSON.stringify(data.categories));
          }
        })
        .catch((err) => console.error("Error cargando categorías:", err));
    }
  }, []);

  const handleInputChange = (e) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  const openModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setNewCategory(cat);
    } else {
      setEditingCategory(null);
      setNewCategory({ name: "" });
    }
    setModalIsOpen(true);
  };

  const handleSaveCategory = async () => {
    const categorySchema = Yup.object().shape({
      name: Yup.string().trim().required("El nombre es obligatorio."),
    });

    try {
      await categorySchema.validate(newCategory, { abortEarly: false });
      setErrorMessages({}); // Limpia errores

      // Guardar o actualizar categoría
      let updated;
      if (editingCategory) {
        updated = categories.map((c) =>
          c.id === editingCategory.id
            ? { ...newCategory, id: c.id }
            : c
        );
      } else {
        updated = [...categories, { ...newCategory, id: categories.length + 1 }];
      }
      setCategories(updated);
      localStorage.setItem("categories", JSON.stringify(updated));
      setModalIsOpen(false);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const msgs = {};
        err.inner.forEach((e) => {
          msgs[e.path] = e.message;
        });
        setErrorMessages(msgs);
      }
    }
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm("¿Eliminar esta categoría?")) {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      localStorage.setItem("categories", JSON.stringify(updated));
    }
  };

  return (
    <div className="categories-container">
      <h2>Lista de Categorías</h2>
      <button className="add-button" onClick={() => openModal()}>
        <PlusCircle size={18} style={{ marginRight: 6 }} />
        Agregar Categoría
      </button>

      <table className="category-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => openModal(category)}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteCategory(category.id)}
                >
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
        contentLabel={editingCategory ? "Editar Categoría" : "Agregar Categoría"}
        overlayClassName="overlay"
        className="modalCategoria"
      >
        <h2>{editingCategory ? "Editar Categoría" : "Agregar Nueva Categoría"}</h2>
        <input
          type="text"
          name="name"
          placeholder="Nombre de la categoría"
          value={newCategory.name}
          onChange={handleInputChange}
        />
        {errorMessages.name && (
          <div className="error-message">{errorMessages.name}</div>
        )}
        <button className="save" onClick={handleSaveCategory}>
          {editingCategory ? "Actualizar" : "Guardar"}
        </button>
        <button className="cancel" onClick={() => setModalIsOpen(false)}>
          Cancelar
        </button>
      </Modal>
    </div>
  );
}

export default Categories;

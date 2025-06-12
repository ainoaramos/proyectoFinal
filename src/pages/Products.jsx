import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Eye, Edit, Trash2, X } from "lucide-react";
import "./Products.css";
import * as Yup from "yup";


Modal.setAppElement("#root");

const validationSchema = Yup.object({
  name: Yup.string().required("El nombre es obligatorio."),
  description: Yup.string().required("La descripción es obligatoria."),
  price: Yup.number()
  .transform((value, originalValue) => {
    return originalValue.trim() === "" ? NaN : Number(originalValue);
  })
  .required("El precio es obligatorio.")  
  .positive("El precio debe ser mayor que cero.") 
  .typeError("El precio debe ser un número válido."),

  brand: Yup.string(),
  model: Yup.string(),
  weight: Yup.string(),
});

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  const [newProduct, setNewProduct] = useState({
    name: "",
    stock: 0,
    image: "",
    description: "",
    price: "",
    categoryId: "",
    brand: "",
    model: "",
    weight: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadProductsAndCategories = async () => {
      try {
        let loadedCategories = JSON.parse(localStorage.getItem("categories"));
        let loadedProducts = JSON.parse(localStorage.getItem("products"));

        if (!loadedCategories || !Array.isArray(loadedCategories)) {
          const { categories: cats } = await fetch("/data.json").then(r => r.json());
          loadedCategories = cats || [];
          localStorage.setItem("categories", JSON.stringify(loadedCategories));
        }

        if (!loadedProducts || !Array.isArray(loadedProducts)) {
          const { products: prods } = await fetch("/data.json").then(r => r.json());
          loadedProducts = prods || [];
          localStorage.setItem("products", JSON.stringify(loadedProducts));
        }

        setCategories(loadedCategories);
        setProducts(loadedProducts);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadProductsAndCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (product = null, onlyView = false) => {
    setEditingProduct(product);
    setViewOnly(onlyView);
    setNewProduct(
      product
        ? { ...product }
        : {
            name: "",
            stock: 0,
            image: "",
            description: "",
            price: "",
            categoryId: "",
            brand: "",
            model: "",
            weight: "",
          }
    );
    setModalIsOpen(true);
  };

 
  const handleSaveProduct = async () => {
    try {
      await validationSchema.validate(newProduct, { abortEarly: false });
      setErrorMessages({});
  
      const toSave = { ...newProduct, categoryId: Number(newProduct.categoryId) };
      const updated = editingProduct
        ? products.map(p => p.id === editingProduct.id ? toSave : p)
        : [...products, { ...toSave, id: products.length + 1, stock: 0 }];
  
      setProducts(updated);
      localStorage.setItem("products", JSON.stringify(updated));
  
      const entry = {
        id: Date.now(),
        productId: updated[updated.length - 1].id,
        supplierId: "No hay proveedor",
        entryDate: new Date().toISOString().split("T")[0],
        entryQuantity: 0,
        purchasePrice: "No hay precio",
        salePrice: newProduct.price,
      };
      const entries = JSON.parse(localStorage.getItem("entries")) || [];
      entries.push(entry);
      localStorage.setItem("entries", JSON.stringify(entries));
  
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
  
  

  const handleDeleteProduct = (id) => {
    if (window.confirm("¿Eliminar este producto?")) {
      const entries = (JSON.parse(localStorage.getItem("entries")) || [])
        .filter(e => e.productId !== id);
      localStorage.setItem("entries", JSON.stringify(entries));

      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem("products", JSON.stringify(updated));
    }
  };

  const getCategoryName = (id) =>
    categories.find(c => c.id === Number(id))?.name || "N/A";

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!selectedCategory || Number(p.categoryId) === Number(selectedCategory))
  );

  return (
    <div className="products-container">
      <h2>Lista de Productos</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <button className="add-button" onClick={() => openModal()}>
        <PlusCircle size={18} style={{ marginRight: 6 }} />
        Agregar Producto
      </button>

      <table className="product-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
  {filtered.map(prod => (
    <tr key={prod.id}>
      <td data-label="Imagen"><img src={prod.image} alt={prod.name} className="product-image" /></td>
      <td data-label="Nombre">{prod.name}</td>
      <td data-label="Precio">${prod.price}</td>
      <td data-label="Stock">{prod.stock}</td>
      <td data-label="Categoría">{getCategoryName(prod.categoryId)}</td>
      <td data-label="Acciones">
        <button className="show-button" onClick={() => openModal(prod, true)}><Eye size={16} /></button>
        <button className="edit-button" onClick={() => openModal(prod, false)}><Edit size={16} /></button>
        <button className="delete-button" onClick={() => handleDeleteProduct(prod.id)}><Trash2 size={16} /></button>
      </td>
    </tr>
  ))}
</tbody>

      </table>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel={viewOnly ? "Detalles del Producto" : (editingProduct ? "Editar Producto" : "Agregar Producto")}
        className="modalProduct"
        overlayClassName="overlayProduct"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>
            {viewOnly
              ? "Detalles del Producto"
              : editingProduct
              ? "Editar Producto"
              : "Agregar Nuevo Producto"}
          </h2>
          <button className="close-button" onClick={() => setModalIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {viewOnly ? (
          <div className="product-details">
            <p><strong>Nombre:</strong> {newProduct.name}</p>
            <p><strong>Descripción:</strong> {newProduct.description}</p>
            <p><strong>Precio:</strong> ${newProduct.price}</p>
            <p><strong>Stock:</strong> {newProduct.stock}</p>
            <p><strong>Categoría:</strong> {getCategoryName(newProduct.categoryId)}</p>
            {/* <p><strong>Marca:</strong> {newProduct.brand}</p>
            <p><strong>Modelo:</strong> {newProduct.model}</p>
            <p><strong>Peso:</strong> {newProduct.weight}</p> */}
            <img src={newProduct.image} alt={newProduct.name} className="product-image" />
          </div>
        ) : (
          <>
            <label>Nombre:</label>
            <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} />
            {errorMessages.name && <div className="error">{errorMessages.name}</div>}

            <label>Descripción:</label>
            <textarea name="description" value={newProduct.description} onChange={handleInputChange} />
            {errorMessages.description && <div className="error">{errorMessages.description}</div>}

            <label>Precio:</label>
            <input type="text" name="price" value={newProduct.price} onChange={handleInputChange} />
            {errorMessages.price && <div className="error">{errorMessages.price}</div>}

            <label>Categoría:</label>
            <select name="categoryId" value={newProduct.categoryId} onChange={handleInputChange}>
              <option value="">Seleccione Categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errorMessages.categoryId && <div className="error">{errorMessages.categoryId}</div>}

            <label>Imagen:</label>
            <input type="file" onChange={handleImageChange} />
            {newProduct.image && <img src={newProduct.image} alt={newProduct.name} className="product-image" />}
          </>
        )}

        <div className="modalProduct-buttons-product">
          <button className="cancel" onClick={() => setModalIsOpen(false)}>Cancelar</button>
          {!viewOnly && (
            <button className="confirm" onClick={handleSaveProduct}>
              {editingProduct ? "Guardar Cambios" : "Agregar Producto"}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Products;

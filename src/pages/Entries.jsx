import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "./Entries.css";
import * as yup from "yup";
import { Edit } from "lucide-react"; 

Modal.setAppElement("#root");

function Entries() {
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [newEntry, setNewEntry] = useState({
    id: "",
    productId: "",
    supplierId: "",
    entryQuantity: "",
    purchasePrice: "",
   
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [entryDate, setEntryDate] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const navigate = useNavigate();
  const [showAllEntries, setShowAllEntries] = useState(false);
  const resetFilters = () => {
    setEntryDate("");
    setSelectedProductId("");
    setSelectedSupplierId("");
    setShowLowStockOnly(false);
  };
  


  const schema = yup.object().shape({
    productId: yup.string().required("Seleccione un producto válido"),
    supplierId: yup.string().required("Seleccione un proveedor válido"),
    entryQuantity: yup
      .number()
      .typeError("Debe ser un número")
      .positive("Debe ser mayor a 0")
      .required("La cantidad es obligatoria"),
    purchasePrice: yup
      .number()
      .typeError("Debe ser un número")
      .positive("Debe ser mayor a 0")
      .required("El precio de compra es obligatorio"),
  });
  

  useEffect(() => {
    const loadData = async () => {
      try {
        let loadedEntries = JSON.parse(localStorage.getItem("entries")) || [];
        let loadedProducts = JSON.parse(localStorage.getItem("products")) || [];
        let loadedSuppliers = JSON.parse(localStorage.getItem("suppliers")) || [];

        if (!loadedEntries.length || !loadedProducts.length || !loadedSuppliers.length) {
          const response = await fetch("/data.json");
          if (!response.ok) throw new Error("Error al cargar el archivo JSON");
          const data = await response.json();

          loadedEntries = data.entries || [];
          loadedProducts = data.products || [];
          loadedSuppliers = data.suppliers || [];

          localStorage.setItem("entries", JSON.stringify(loadedEntries));
          localStorage.setItem("products", JSON.stringify(loadedProducts));
          localStorage.setItem("suppliers", JSON.stringify(loadedSuppliers));
        }

        // Filtrar entradas con productos no existentes
        loadedEntries = loadedEntries.filter(entry => 
          loadedProducts.some(product => product.id === entry.productId)
        );

        setEntries(loadedEntries);
        setProducts(loadedProducts);
        setSuppliers(loadedSuppliers);
      } catch (error) {
        console.error("Error cargando los datos:", error);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEntry = () => {
    const { productId, supplierId, entryQuantity, purchasePrice, id } = newEntry;
    
    const productExists = products.some(product => product.id === Number(productId));
    if (!productExists) {
      alert("El producto seleccionado no existe. La entrada será eliminada.");
      handleDeleteEntry(id); 
      return;
    }

    if (
      !productId ||
      !supplierId ||
      !entryQuantity ||
      !purchasePrice ||
      isNaN(entryQuantity) ||
      isNaN(purchasePrice) ||
      entryQuantity <= 0 ||
      purchasePrice <= 0 
    ) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    const quantity = parseInt(entryQuantity, 10);
    const updatedProducts = products.map((product) => {
      if (product.id === Number(productId)) {
        const previousEntryQuantity = entries.find((entry) => entry.id === id)?.entryQuantity || 0;
        const stockChange = quantity - previousEntryQuantity;
        return {
          ...product,
          stock: product.stock + stockChange,
        };
      }
      return product;
    });

    const updatedEntries = isEdit
      ? entries.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                productId: Number(productId),
                supplierId: Number(supplierId),
                entryQuantity: quantity,
                purchasePrice,
                entryDate: new Date().toISOString().split("T")[0],
              }
            : entry
        )
      : [
          ...entries,
          {
            id: entries.length + 1,
            productId: Number(productId),
            supplierId: Number(supplierId),
            entryQuantity: quantity,
            purchasePrice,
            entryDate: new Date().toISOString().split("T")[0],
          },
        ];

    setEntries(updatedEntries);
    setProducts(updatedProducts);
    localStorage.setItem("entries", JSON.stringify(updatedEntries));
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    closeModal();
  };

  const getProductNameById = (productId) => {
    const product = products.find((prod) => prod.id === Number(productId));
    return product ? product.name : "Producto no encontrado";
  };

  const getSupplierNameById = (supplierId) => {
    const supplier = suppliers.find((sup) => sup.id === Number(supplierId));
    return supplier ? supplier.name : "Proveedor desconocido";
  };

  const getTotalStock = (productId) => {
    const product = products.find((prod) => prod.id === productId);
    return product ? product.stock : 0;
  };

  const isStockLow = (stock) => stock <= 5;

  const handleDeleteEntry = (entryId) => {
    const updatedEntries = entries.filter((entry) => entry.id !== entryId);
    setEntries(updatedEntries);
    localStorage.setItem("entries", JSON.stringify(updatedEntries));
  };

  const handleEditEntry = (entry) => {
    setNewEntry(entry);
    setIsEdit(true);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setIsEdit(false);
    setNewEntry({ productId: "", supplierId: "", entryQuantity: "", purchasePrice: ""});
  };

  const handleProductFilterChange = (e) => {
    setSelectedProductId(e.target.value);
  };

  const handleSupplierFilterChange = (e) => {
    setSelectedSupplierId(e.target.value);
  };

  return (
    <div className="entries-container">
      <h2>Entradas de Stock</h2>
      <button className="add-button" onClick={() => setModalIsOpen(true)}>
        Agregar Entrada
      </button>
      <button
        onClick={resetFilters}
        style={{
          padding: "8px 12px",
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Quitar filtros
      </button>


      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          style={{
            marginRight: "10px",
            padding: "8px 12px",
            backgroundColor: showLowStockOnly ? "#f39c12" : "#3498db",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showLowStockOnly ? "Ver todos los productos" : "Ver productos con stock bajo"}
        </button>

        <button
          onClick={() => setShowAllEntries(!showAllEntries)}
          style={{
            marginRight: "10px",
            padding: "8px 12px",
            backgroundColor: showAllEntries ? "#27ae60" : "#8e44ad",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showAllEntries ? "Última entrada" : "Todas las entradas"}
        </button>


        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "5px", border: "1px solid #ccc" }}
        />

        <select
          name="product"
          value={selectedProductId}
          onChange={handleProductFilterChange}
          style={{ marginLeft: "10px", padding: "8px 12px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          <option value="">Seleccionar producto</option>
          {products.map((product) => (
            <option key={`product-${product.id}`} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <select
          name="supplier"
          value={selectedSupplierId}
          onChange={handleSupplierFilterChange}
          style={{ marginLeft: "10px", padding: "8px 12px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          <option value="">Seleccionar proveedor</option>
          {suppliers.map((supplier) => (
            <option key={`supplier-${supplier.id}`} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} 
      className="modalEntrada" 
      overlayClassName="overlay">
        <h2>{isEdit ? "Editar Entrada de Stock" : "Agregar Entrada de Stock"}</h2>
        <select name="productId" value={newEntry.productId} onChange={handleInputChange}>
          <option value="">Seleccione un producto</option>
          {products.map((product) => (
            <option key={`product-${product.id}`} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <select name="supplierId" value={newEntry.supplierId} onChange={handleInputChange}>
          <option value="">Seleccione un proveedor</option>
          {suppliers.map((supplier) => (
            <option key={`supplier-${supplier.id}`} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="entryQuantity"
          placeholder="Cantidad"
          value={newEntry.entryQuantity}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="purchasePrice"
          placeholder="Precio de compra"
          value={newEntry.purchasePrice}
          onChange={handleInputChange}
        />

        <button onClick={handleSaveEntry}>{isEdit ? "Actualizar" : "Guardar"}</button>
        <button onClick={closeModal}>Cancelar</button>
      </Modal>

      <table className="entries-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Proveedor</th>
            <th>Cantidad </th>
            <th>Fecha </th>
            <th>Stock Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entries
            .filter((entry) => {
              const isLowStockOk = !showLowStockOnly || isStockLow(getTotalStock(entry.productId));
              const isProductMatch = selectedProductId === "" || entry.productId === Number(selectedProductId);
              const isSupplierMatch = selectedSupplierId === "" || entry.supplierId === Number(selectedSupplierId);
              const isDateMatch = entryDate === "" || entry.entryDate === entryDate;
              return isLowStockOk && isProductMatch && isSupplierMatch && isDateMatch;
            })
            .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
            .reduce((acc, entry) => {
              if (showAllEntries) {
                acc.push(entry);
              } else {
                const exists = acc.find((e) => e.productId === entry.productId);
                if (!exists) acc.push(entry);
              }
              return acc;
            }, [])

            .map((entry) => (
              <tr key={`entry-${entry.id}`} className={isStockLow(getTotalStock(entry.productId)) ? "low-stock" : ""}>
              <td data-label="Producto">{getProductNameById(entry.productId)}</td>
              <td data-label="Proveedor">{getSupplierNameById(entry.supplierId)}</td>
              <td data-label="Cantidad">{entry.entryQuantity}</td>
              <td data-label="Fecha">{entry.entryDate}</td>
              <td data-label="Stock">{getTotalStock(entry.productId)}</td>
              <td data-label="Acciones">
                <button
                  className="edit-button"
                  onClick={() => handleEditEntry(entry)}
                  title="Editar Entrada"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <Edit size={16} />
                </button>
              </td>
            </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Entries;

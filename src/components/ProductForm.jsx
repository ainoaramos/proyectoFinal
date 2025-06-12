import React, { useState } from "react";

function ProductForm({ setProducts }) {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!name || !stock) return;

    const newProduct = { name, stock: parseInt(stock, 10) };
    
    setProducts((prevProducts) => [...prevProducts, newProduct]);

    setName("");
    setStock("");
  };

  return (
    <div className="product-form">
      <h3>Agregar Producto</h3>
      <form onSubmit={handleAddProduct}>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
        <button type="submit">Añadir Producto</button>
      </form>
    </div>
  );
}

export default ProductForm;

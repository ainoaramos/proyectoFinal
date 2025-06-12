import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import "./Billing.css";
import { Edit, Printer } from "lucide-react";


Modal.setAppElement("#root");

function Billing() {
  const [bills, setBills] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newBill, setNewBill] = useState({ client: "", items: [] });
  const [billToEdit, setBillToEdit] = useState(null);
  const [clientFilter, setClientFilter] = useState(""); 
  const [dateFilter, setDateFilter] = useState("");
  const [billNumberFilter, setBillNumberFilter] = useState("");    
   
  const navigate = useNavigate();

  const addTotalsToBills = (billsList, productsList) =>
    billsList.map((bill) => {
      const updatedItems = bill.items.map(item => {
        const product = productsList.find(p => Number(p.id) === Number(item.productId));
        if (product) {
          const totalPrice = item.quantity * product.price;
          return {
            ...item,
            price: product.price,
            total: totalPrice.toFixed(2),
          };
        }
        return item;
      });

      const total = updatedItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
      return { ...bill, items: updatedItems, total: total.toFixed(2) };
    });

  useEffect(() => {
    const loadData = async () => {
      const storedClients = localStorage.getItem("clients");
      const storedProducts = localStorage.getItem("products");
      const storedBills = localStorage.getItem("bills");
      const storedSales = localStorage.getItem("salidas");

      if (storedClients && storedProducts && storedBills && storedSales) {
        const parsedClients = JSON.parse(storedClients);
        const parsedProducts = JSON.parse(storedProducts);
        const parsedBills = JSON.parse(storedBills);
        const parsedSales = JSON.parse(storedSales);

        setClients(parsedClients);
        setProducts(parsedProducts);
        setBills(addTotalsToBills(parsedBills, parsedProducts));
        setSales(parsedSales);
      } else {
        const response = await fetch("/data.json");
        const data = await response.json();

        const billsWithTotal = addTotalsToBills(data.sales || [], data.products || []);
        localStorage.setItem("clients", JSON.stringify(data.clients));
        localStorage.setItem("products", JSON.stringify(data.products));
        localStorage.setItem("bills", JSON.stringify(billsWithTotal));
        localStorage.setItem("salidas", JSON.stringify(data.sales));

        setClients(data.clients || []);
        setProducts(data.products || []);
        setBills(billsWithTotal);
        setSales(data.sales || []);
      }
    };

    loadData();
  }, []);

  const getAvailableStock = (productId, selectedItems, productsList, billToEdit) => {
    const product = productsList.find(p => p.id === productId);
    if (!product) return 0;
  
    let currentStock = product.stock;

    if (billToEdit) {
 
      const previousItem = billToEdit.items.find(item => item.productId === productId);
      if (previousItem) {
        currentStock += previousItem.quantity; 
      }
    }

    const quantityInForm = selectedItems
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + Number(item.quantity), 0);
  
    return currentStock - quantityInForm;
  };
  

  const calculateTotal = useMemo(() => {
    return newBill.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? sum + item.quantity * product.price : sum;
    }, 0).toFixed(2);
  }, [newBill.items, products]);

  const handleProductChange = (productId, newQuantity, index) => {
    const product = products.find((p) => p.id === Number(productId));
    newQuantity = Number(newQuantity);
  
    if (!product) {
      alert("Producto no encontrado.");
      return;
    }
  
    if (newQuantity < 0) {
      alert("La cantidad no puede ser negativa.");
      return;
    }
  
    const otherItems = newBill.items.filter((_, i) => i !== index);
    const availableStock = getAvailableStock(product.id, otherItems, products, billToEdit);
  
    if (newQuantity > availableStock) {
      alert(`No hay suficiente stock disponible. Solo hay ${availableStock} unidades disponibles.`);
      return;
    }
  
    const updatedItems = [...newBill.items];
    updatedItems[index] = {
      productId: Number(productId),
      quantity: newQuantity,
      price: product.price,
    };
  
    setNewBill({ ...newBill, items: updatedItems });
  };
  
  

  const handleAddProductToBill = () => {
    setNewBill({
      ...newBill,
      items: [...newBill.items, { productId: "", quantity: 0 }],
    });
  };

  const handleDeleteProduct = (index) => {
    const updatedItems = newBill.items.filter((_, i) => i !== index);
    setNewBill({ ...newBill, items: updatedItems });
  };

  const getClientName = (clientId) => {
    const client = clients.find((cli) => cli.id === Number(clientId));
    return client ? `${client.name} ${client.surname}` : "Desconocido";
  };

  const handleSaveBill = () => {
    if (!newBill.client || newBill.items.length === 0) {
      alert("Debe seleccionar un cliente y al menos un producto.");
      return;
    }
    if (!newBill.client || newBill.client === "Desconocido") {
      const updatedSales = sales.filter(sale => sale.id !== newBill.id);
      localStorage.setItem("salidas", JSON.stringify(updatedSales));
      setSales(updatedSales);
    }
    
    
    const updatedProducts = [...products];
    const newSales = [];
  
    if (billToEdit) {
      for (const item of billToEdit.items) {
        const product = updatedProducts.find(p => p.id === item.productId);
        if (product) {
          product.stock += item.quantity;
        }
      }
    }
  
    for (const item of newBill.items) {
      const product = updatedProducts.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        alert("Stock insuficiente para el producto seleccionado.");
        return;
      }
  
      product.stock -= item.quantity; 
      newSales.push({
        id: sales.length + newSales.length + 1,
        productId: item.productId,
        saleQuantity: item.quantity,
        salePrice: item.price,
        saleDate: new Date().toISOString().split("T")[0],
      });
    }
  
    const newBillData = {
      id: bills.length + 1,
      clientId: newBill.client,
      items: newBill.items,
      date: new Date().toISOString().split("T")[0],
      total: calculateTotal,
    };
  
    const updatedBills = [...bills, newBillData];
    const updatedSales = [...sales, ...newSales];
  
    setBills(updatedBills);
    setProducts(updatedProducts);
    setSales(updatedSales);
  
    localStorage.setItem("bills", JSON.stringify(updatedBills));
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    localStorage.setItem("salidas", JSON.stringify(updatedSales));
  
    setModalIsOpen(false);
    setNewBill({ client: "", items: [] });
    setBillToEdit(null);
  };
  

  const handlePrint = (bill) => {
    const logoUrl = "/control.png"; 
  
    const html = `
      <html>
        <head>
          
          <style>
            /* Reset básico */
            * { box-sizing: border-box; margin: 0; padding: 0; }
  
            body {
              font-family: 'Poppins', sans-serif;
              color: #34495e;
              background-color: #f5f7f9;
              padding: 2rem;
              position: relative;
              overflow: hidden;
            }
  
         
  
            .invoice-container {
              position: relative;
              background: #fdfdfd; /* Color de fondo del contenedor */
              padding: 3rem; /* Aumentado el padding */
              border-radius: 1.5rem; /* Bordes redondeados más suaves */
              box-shadow: 0 12px 30px rgba(0,0,0,0.1); /* Sombra más marcada */
              max-width: 1000px; /* Más ancho */
              margin: auto;
              z-index: 1;
              border: 2px solid #6B8F89; /* Borde del contenedor */
            }
  
            .invoice-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 3px solid #6B8F89;
              padding-bottom: 1rem;
              margin-bottom: 1.5rem;
            }
            .invoice-header img { height: 70px; } /* Aumentado el tamaño del logo */
            .company-details {
              text-align: right;
              font-size: 1rem;
              color: #6B8F89;
            }
            .invoice-header h1 {
              font-size: 2.5rem; /* Título más grande */
              color: #34495e;
              font-weight: bold;
            }
  
            .invoice-info {
              margin-bottom: 2rem;
              font-size: 1.2rem; /* Mayor tamaño para los datos */
              line-height: 1.6;
            }
            .invoice-info p { margin: 0.5rem 0; }
            .invoice-info span { font-weight: bold; }
  
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 2rem;
              font-size: 1rem;
            }
  
            th, td {
              padding: 1rem;
              border: 1px solid #ddd;
              text-align: left;
            }
            th {
              background: #6B8F89;
              color: white;
              font-weight: bold;
            }
            td {
              background: #f9f9f9;
            }
  
            .total-container {
              display: flex;
              justify-content: space-between;
              margin-top: 2rem;
              font-size: 1.3rem;
              font-weight: bold;
              border-top: 2px solid #ddd;
              padding-top: 1rem;
            }
            .total-container span { font-size: 1.5rem; color: #34495e; }
  
            /* Pie de página */
            .footer {
              margin-top: 2rem;
              text-align: center;
              font-size: 1rem;
              color: #34495e;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Cabecera de la factura -->
            <div class="invoice-header">
              <img src="${logoUrl}" alt="Logo" />
              <h1>Factura</h1>
            </div>
            
            <!-- Información de la empresa -->
            <div class="company-details">
              <p>Empresa ControlStock</p>
              <p>Dirección: Calle Oliver, Alcoy, España</p>
              <p>Teléfono: 967856432</p>
            </div>
  
            <!-- Información del cliente -->
            <div class="invoice-info">
              <p><span>Cliente:</span> ${getClientName(bill.clientId)}</p>
              <p><span>Fecha:</span> ${bill.date}</p>
            </div>
  
            <!-- Tabla de productos -->
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${bill.items.map(item => {
                  const prod = products.find(p => p.id === item.productId) || {};
                  const lineTotal = (item.quantity * (prod.price || 0)).toFixed(2);
                  return `
                    <tr>
                      <td>${prod.name || "Producto no encontrado"}</td>
                      <td>${item.quantity}</td>
                      <td>$${(prod.price || 0).toFixed(2)}</td>
                      <td>$${lineTotal}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
  
            <!-- Total -->
            <div class="total-container">
              <span>Total Factura:</span>
              <span>$${bill.total}</span>
            </div>
  
            <!-- Pie de página -->
            <div class="footer">
              <p>Gracias por su compra. ¡Esperamos verle nuevamente!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  
    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  
  

  const handleEdit = (bill) => {
    setBillToEdit(bill); 
    setNewBill({
      client: bill.clientId,
      items: bill.items,
    });
    setModalIsOpen(true); 
  };




  return (
    <div className="billing">
      <h1>Facturación</h1>
      <button onClick={() => { 
        setBillToEdit(null); 
        setNewBill({ client: "", items: [] }); 
        setModalIsOpen(true); 
      }}>Nueva Factura</button>

<div className="filters">
        <input
          type="text"
          placeholder="Número de Factura"
          value={billNumberFilter}
          onChange={(e) => setBillNumberFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Cliente"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th># Factura</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {bills
              .filter((bill) =>
              (billNumberFilter ? bill.id.toString().includes(billNumberFilter) : true) &&
              (clientFilter ? getClientName(bill.clientId).toLowerCase().includes(clientFilter.toLowerCase()) : true) &&
              (dateFilter ? bill.date.includes(dateFilter) : true)
              )
          .map((bill) => (
            <tr key={bill.id}>
                   <td data-label="# Factura">{bill.id}</td>
        <td data-label="Cliente">{getClientName(bill.clientId)}</td>
        <td data-label="Fecha">{bill.date}</td>
        <td data-label="Total">${bill.total}</td>
        <td data-label="Acciones">
          <button onClick={() => handlePrint(bill)} title="Imprimir">
            <Printer size={20} />
          </button>
          <button onClick={() => handleEdit(bill)} title="Editar">
            <Edit size={20} />
          </button>
        </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="modal-content" overlayClassName="modal-overlay">
        <h2>{billToEdit ? "Editar Factura" : "Nueva Factura"}</h2>
        <label>Cliente:</label>
        <select
          value={newBill.client}
          onChange={(e) => setNewBill({ ...newBill, client: e.target.value })}
        >
          <option value="">Seleccione un cliente</option>
          {clients.map((cli) => (
            <option key={cli.id} value={cli.id}>
              {cli.name} {cli.surname}
            </option>
          ))}
        </select>

        <h3>Productos</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total Producto</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {newBill.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <select
                    value={item.productId}
                    onChange={(e) =>
                      handleProductChange(e.target.value, item.quantity, index)
                    }
                  >
                    <option value="">Seleccione un producto</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} (${prod.price}) - Stock disponible: {
                        getAvailableStock(
                          prod.id, 
                          newBill.items, 
                          products,
                          billToEdit)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) =>
                      handleProductChange(item.productId, e.target.value, index)
                    }
                  />
                </td>
                <td style={{ textAlign: "right", minWidth: "100px" }}>
                  ${products.find(p => p.id === item.productId)?.price || 0}
                </td>
                <td style={{ textAlign: "right", minWidth: "120px" }}>
                  ${(
                    item.quantity *
                    (products.find(p => p.id === item.productId)?.price || 0)
                  ).toFixed(2)}
                </td>
                <td>
                  <button onClick={() => handleDeleteProduct(index)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleAddProductToBill}>Agregar Producto</button>
        <p><strong>Total:</strong> ${calculateTotal}</p>
        <button onClick={handleSaveBill}>Guardar Factura</button>
        <button onClick={() => setModalIsOpen(false)}>Cancelar</button>
      </Modal>

    </div>
  );
}

export default Billing;

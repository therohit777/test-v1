import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";


const TaskManagement = () => {
  const apiBaseUrl = "http://127.0.0.1:8000"; // Update this to match your backend API URL
  const defaultTask = [
    {
      taskName: "Default Task",
      startTime: "2024-01-01T09:00",
      endTime: "2024-01-01T17:00",
      cost: 100,
      inputProduct: ["Product A"],
      outputProduct: ["Product B"],
      documentation: "Sample documentation",
    },
  ];

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductTable, setShowProductTable] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentEditProduct, setCurrentEditProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    cost: 0,
    inputTask: [],
    outputTask: [],
    deploymentStatus: false,
  });

  // Fetch all products from the backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/all`);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Create Product
  const handleCreateProduct = async () => {
    try {
      const product = {
        ...newProduct,
        creationTime: new Date().toISOString(),
      };
      const response = await axios.post(`${apiBaseUrl}/create`, product);
      setProducts([...products, response.data.product]);
      setNewProduct({ name: "", cost: 0, inputTask: [], outputTask: [], deploymentStatus: false });
      setShowCreateProductModal(false);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // Handle Edit Product
  const handleEditProduct = async () => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/edit/${currentEditProduct._id}`,
        currentEditProduct
      );
      setProducts((prev) =>
        prev.map((product) =>
          product._id === response.data.product._id ? response.data.product : product
        )
      );
      setShowEditProductModal(false);
    } catch (error) {
      console.error("Error editing product:", error);
    }
  };

  // Handle Remove Product
  const handleRemoveProduct = async (productId) => {
    try {
      await axios.post(`${apiBaseUrl}/delete/${productId}`);
      setProducts(products.filter((product) => product._id !== productId));
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Handle Deployment
  const handleDeploy = async () => {
    try {
      for (const productId of selectedProducts) {
        await axios.post(`${apiBaseUrl}/change-deployment/${productId}`, {
          deploymentStatus: true,
        });
      }
      setProducts((prev) =>
        prev.map((product) =>
          selectedProducts.includes(product._id)
            ? { ...product, deploymentStatus: true }
            : product
        )
      );
      setSelectedProducts([]); // Clear selections after deployment
      alert(`Deployed: ${selectedProducts.join(", ")}`);
    } catch (error) {
      console.error("Error deploying products:", error);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deploymentButtonClass =
    selectedProducts.length === products.length
      ? "deploy-white"
      : selectedProducts.length > 0
      ? "deploy-red"
      : "deploy-blue";

  return (
    <div className="container">
      <header className="header">
        <h1>Task Management</h1>
        <button className={`deploy-button ${deploymentButtonClass}`} onClick={handleDeploy}>
          Deploy {selectedProducts.length === products.length ? "All" : ""} (
          {selectedProducts.length})
        </button>
      </header>

      <div className="action-buttons">
        <button onClick={() => setShowProductTable(true)}>Input Task</button>
        <button>Output Task</button>
      </div>

      {showProductTable && (
        <div className="modal">
          <div className="modal-content">
            <h2>Input Products</h2>
            <div className="actions">
              <button
                className="close-button"
                onClick={() => setShowProductTable(false)}
              >
                Close
              </button>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="create-button"
                onClick={() => setShowCreateProductModal(true)}
              >
                Create Product
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Name</th>
                  <th>Creation Time</th>
                  <th>Cost</th>
                  <th>Deployment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectProduct(product._id)}
                      />
                    </td>
                    <td
                      className="editable-name"
                      onClick={() => {
                        setCurrentEditProduct(product);
                        setShowEditProductModal(true);
                      }}
                    >
                      {product.name}
                    </td>
                    <td>{new Date(product.creationTime).toLocaleString()}</td>
                    <td>${product.cost}</td>
                    <td>{product.deploymentStatus ? "Deployed" : "Pending"}</td>
                    <td>
                      <button
                        className="remove-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProduct(product._id);
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateProductModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Product</h2>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Cost:</label>
              <input
                type="number"
                value={newProduct.cost}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="form-group">
              <label>Input Task:</label>
              <select
                value={newProduct.inputTask[0] || ""}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    inputTask: [e.target.value],
                  }))
                }
              >
                <option value="">-- Select an Input Task --</option>
                {defaultTask.map((task) => (
                  <option key={task.taskName} value={task.taskName}>
                    {task.taskName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Output Task:</label>
              <select
                value={newProduct.outputTask[0] || ""}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    outputTask: [e.target.value],
                  }))
                }
              >
                <option value="">-- Select an Output Task --</option>
                {defaultTask.map((task) => (
                  <option key={task.taskName} value={task.taskName}>
                    {task.taskName}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowCreateProductModal(false)}
              >
                Cancel
              </button>
              <button className="save-button" onClick={handleCreateProduct}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditProductModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Product</h2>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={currentEditProduct.name}
                onChange={(e) =>
                  setCurrentEditProduct((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Cost:</label>
              <input
                type="number"
                value={currentEditProduct.cost}
                onChange={(e) =>
                  setCurrentEditProduct((prev) => ({
                    ...prev,
                    cost: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Input Task:</label>
              <select
                value={currentEditProduct.inputTask[0] || ""}
                onChange={(e) =>
                  setCurrentEditProduct((prev) => ({
                    ...prev,
                    inputTask: [e.target.value],
                  }))
                }
              >
                <option value="">-- Select an Input Task --</option>
                {defaultTask.map((task) => (
                  <option key={task.taskName} value={task.taskName}>
                    {task.taskName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Output Task:</label>
              <select
                value={currentEditProduct.outputTask[0] || ""}
                onChange={(e) =>
                  setCurrentEditProduct((prev) => ({
                    ...prev,
                    outputTask: [e.target.value],
                  }))
                }
              >
                <option value="">-- Select an Output Task --</option>
                {defaultTask.map((task) => (
                  <option key={task.taskName} value={task.taskName}>
                    {task.taskName}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowEditProductModal(false)}
              >
                Cancel
              </button>
              <button className="save-button" onClick={handleEditProduct}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;

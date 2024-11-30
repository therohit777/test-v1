import React, { useState } from "react";
import "./styles.css";

const TaskManagement = () => {
  const defaultTask = {
    taskName: "Default Task",
    startTime: "2024-01-01T09:00",
    endTime: "2024-01-01T17:00",
    cost: 100,
    inputProduct: ["Product A"],
    outputProduct: ["Product B"],
    documentation: "Sample documentation",
  };

  // const [tasks, setTasks] = useState([defaultTask]);
  const [products, setProducts] = useState([
    {
      name: "Product A",
      creationTime: "2024-01-01T08:00",
      cost: 50,
      inputTask: ["Default Task"],
      outputTask: [],
      deploymentStatus: false,
    },
    {
      name: "Product B",
      creationTime: "2024-01-01T17:00",
      cost: 75,
      inputTask: [],
      outputTask: ["Default Task"],
      deploymentStatus: false,
    },
  ]);
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

  const handleSelectProduct = (productName) => {
    setSelectedProducts((prev) =>
      prev.includes(productName)
        ? prev.filter((name) => name !== productName)
        : [...prev, productName]
    );
  };

  const handleCreateProduct = () => {
    const product = {
      ...newProduct,
      creationTime: new Date().toISOString(),
    };
    setProducts([...products, product]);
    setNewProduct({ name: "", cost: 0, inputTask: [], outputTask: [], deploymentStatus: false });
    setShowCreateProductModal(false);
  };

  const handleEditProduct = () => {
    setProducts((prev) =>
      prev.map((product) =>
        product.name === currentEditProduct.name ? currentEditProduct : product
      )
    );
    setShowEditProductModal(false);
  };

  const handleRemoveProduct = (productName) => {
    setProducts(products.filter((product) => product.name !== productName));
    setSelectedProducts(
      selectedProducts.filter((product) => product !== productName)
    );
  };

  const handleDeploy = () => {
    setProducts((prev) =>
      prev.map((product) =>
        selectedProducts.includes(product.name)
          ? { ...product, deploymentStatus: true }
          : product
      )
    );
    setSelectedProducts([]); // Unselect all products after deployment
    alert(`Deployed: ${selectedProducts.join(", ")}`);
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
                  <tr key={product.name}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.name)}
                        onChange={() => handleSelectProduct(product.name)}
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
                          handleRemoveProduct(product.name);
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
                {tasks.map((task) => (
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
                {tasks.map((task) => (
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
                {tasks.map((task) => (
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
                {tasks.map((task) => (
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

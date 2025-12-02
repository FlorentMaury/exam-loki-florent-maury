// Tableau de bord admin pour gérer le stock des produits.
import React, { useState, useEffect } from "react";
import { getProducts, updateProductStock } from "../services/adminApi";

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockUpdates, setStockUpdates] = useState({});
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      alert("Erreur lors du chargement des produits.");
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId) => {
    const displayStock = stockUpdates[productId];
    
    if (displayStock === undefined || displayStock === null || displayStock < 0) {
      alert("Le stock doit être un nombre valide positif.");
      return;
    }

    setUpdating(productId);
    try {
      await updateProductStock(productId, parseInt(displayStock));
      
      // Mise à jour de l'état local
      setProducts(
        products.map((p) =>
          p._id === productId ? { ...p, stock: parseInt(displayStock) } : p
        )
      );
      
      setStockUpdates({ ...stockUpdates, [productId]: undefined });
      alert("Stock mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du stock:", error);
      alert("Erreur lors de la mise à jour du stock.");
    } finally {
      setUpdating(null);
    }
  };

  const handleStockChange = (productId, change) => {
    const currentProduct = products.find(p => p._id === productId);
    const currentStock = stockUpdates[productId] !== undefined ? stockUpdates[productId] : currentProduct.stock;
    const newStock = Math.max(0, currentStock + change);
    setStockUpdates({ ...stockUpdates, [productId]: newStock });
  };

  if (loading) {
    return <div className="text-center py-10 text-xl">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-gray-800">Gestion des Stocks</h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Gérer le Stock des Produits</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-3 text-left">Nom du Produit</th>
                  <th className="border p-3 text-center">Stock Actuel</th>
                  <th className="border p-3 text-center">Nouveau Stock</th>
                  <th className="border p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const displayStock = stockUpdates[product._id] !== undefined ? stockUpdates[product._id] : product.stock;
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 border-b">
                      <td className="border p-3">{product.name}</td>
                      <td className="border p-3 text-center font-semibold text-lg">{product.stock}</td>
                      <td className="border p-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleStockChange(product._id, -1)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-bold text-lg"
                            disabled={updating === product._id}
                          >
                            −
                          </button>
                          <span className="w-16 text-center font-bold text-xl border-b-2 border-gray-300 pb-1">
                            {displayStock}
                          </span>
                          <button
                            onClick={() => handleStockChange(product._id, 1)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-bold text-lg"
                            disabled={updating === product._id}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="border p-3 text-center">
                        <button
                          onClick={() => handleStockUpdate(product._id)}
                          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 font-semibold disabled:bg-gray-400"
                          disabled={updating === product._id}
                        >
                          {updating === product._id ? "Mise à jour..." : "Mettre à jour"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const ShippingAddress = () => {
  const { shippingAddress, dispatch } = useCart();
  const [street, setStreet] = useState(shippingAddress.street || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  const handleAddressChange = (event) => {
    const { name, value } = event.target;
    dispatch({ 
      type: 'SET_SHIPPING_ADDRESS', 
      payload: { 
        ...shippingAddress, 
        [name]: value 
      } 
    });
    // Update local state for better user experience (optional)
    switch (name) {
      case 'street':
        setStreet(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'postalCode':
        setPostalCode(value);
        break;
      case 'country':
        setCountry(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="border p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Adresse de livraison</h3>
      <div className="space-y-2">
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
            Rue (5-100 caractères)
          </label>
          <input 
            type="text" 
            id="street" 
            name="street" 
            value={street} 
            onChange={handleAddressChange} 
            placeholder="Ex: 123 Rue de la Paix"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
          />
          <p className="text-xs text-gray-500 mt-1">{street.length}/100 caractères</p>
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Ville (2-50 caractères)
          </label>
          <input 
            type="text" 
            id="city" 
            name="city" 
            value={city} 
            onChange={handleAddressChange} 
            placeholder="Ex: Paris"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
          />
          <p className="text-xs text-gray-500 mt-1">{city.length}/50 caractères</p>
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Code Postal (3-20 caractères)
          </label>
          <input 
            type="text" 
            id="postalCode" 
            name="postalCode" 
            value={postalCode} 
            onChange={handleAddressChange} 
            placeholder="Ex: 75001"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
          />
          <p className="text-xs text-gray-500 mt-1">{postalCode.length}/20 caractères</p>
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Pays (2-50 caractères)
          </label>
          <input 
            type="text" 
            id="country" 
            name="country" 
            value={country} 
            onChange={handleAddressChange} 
            placeholder="Ex: France"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
          />
          <p className="text-xs text-gray-500 mt-1">{country.length}/50 caractères</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddress;
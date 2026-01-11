import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BusForm = ({ bus, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    busNumber: '',
    licensePlate: '',
    capacity: '',
    status: 'inactive',
    driver: '',
    route: '',
  });
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bus) {
      setFormData({
        busNumber: bus.busNumber || '',
        licensePlate: bus.licensePlate || '',
        capacity: bus.capacity || '',
        status: bus.status || 'inactive',
        driver: bus.driver?._id || '',
        route: bus.route?._id || '',
      });
    }
    fetchDriversAndRoutes();
  }, [bus]);

  const fetchDriversAndRoutes = async () => {
    try {
      const [driversRes, routesRes] = await Promise.all([
        api.getDrivers(),
        api.getRoutes(),
      ]);
      setDrivers(driversRes.data || []);
      setRoutes(routesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        busNumber: formData.busNumber,
        licensePlate: formData.licensePlate,
        capacity: parseInt(formData.capacity, 10),
        status: formData.status,
      };

      if (bus) {
        await api.updateBus(bus._id, submitData);
        if (formData.driver && formData.driver !== bus.driver?._id) {
          await api.assignDriverToBus(bus._id, formData.driver);
        }
        if (formData.route && formData.route !== bus.route?._id) {
          await api.assignRouteToBus(bus._id, formData.route);
        }
      } else {
        const created = await api.createBus(submitData);
        if (formData.driver) {
          await api.assignDriverToBus(created.data._id, formData.driver);
        }
        if (formData.route) {
          await api.assignRouteToBus(created.data._id, formData.route);
        }
      }
      onSubmit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bus Number *
        </label>
        <input
          type="text"
          name="busNumber"
          value={formData.busNumber}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          License Plate *
        </label>
        <input
          type="text"
          name="licensePlate"
          value={formData.licensePlate}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capacity *
        </label>
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          className="input-field"
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="input-field"
        >
          <option value="inactive">Inactive</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign Driver
        </label>
        <select
          name="driver"
          value={formData.driver}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">-- Select Driver --</option>
          {drivers.map((driver) => (
            <option key={driver._id} value={driver._id}>
              {driver.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign Route
        </label>
        <select
          name="route"
          value={formData.route}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">-- Select Route --</option>
          {routes.map((route) => (
            <option key={route._id} value={route._id}>
              {route.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : bus ? 'Update Bus' : 'Create Bus'}
        </button>
      </div>
    </form>
  );
};

export default BusForm;

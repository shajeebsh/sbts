import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const WaypointForm = ({ routeId, waypoint, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    longitude: '',
    latitude: '',
    order: '',
    type: 'pickup',
    estimatedArrival: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (waypoint) {
      setFormData({
        name: waypoint.name || '',
        longitude: waypoint.location?.coordinates?.[0] || '',
        latitude: waypoint.location?.coordinates?.[1] || '',
        order: waypoint.order || '',
        type: waypoint.type || 'pickup',
        estimatedArrival: waypoint.estimatedArrival || '',
      });
    }
  }, [waypoint]);

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
        name: formData.name,
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
        order: parseInt(formData.order, 10),
        type: formData.type,
        estimatedArrival: formData.estimatedArrival,
      };

      if (waypoint) {
        await api.updateWaypoint(routeId, waypoint._id, submitData);
      } else {
        await api.addWaypoint(routeId, submitData);
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
          Stop Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude *
          </label>
          <input
            type="number"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="input-field"
            step="0.000001"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude *
          </label>
          <input
            type="number"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="input-field"
            step="0.000001"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order *
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="input-field"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="input-field"
          >
            <option value="pickup">Pickup</option>
            <option value="dropoff">Dropoff</option>
            <option value="school">School</option>
            <option value="checkpoint">Checkpoint</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Arrival
        </label>
        <input
          type="text"
          name="estimatedArrival"
          value={formData.estimatedArrival}
          onChange={handleChange}
          className="input-field"
          placeholder="7:30 AM"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : waypoint ? 'Update Stop' : 'Add Stop'}
        </button>
      </div>
    </form>
  );
};

export default WaypointForm;

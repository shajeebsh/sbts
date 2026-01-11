import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const RouteForm = ({ route, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    morningDeparture: '',
    afternoonDeparture: '',
    distance: '',
    estimatedDuration: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name || '',
        description: route.description || '',
        morningDeparture: route.schedule?.morningDeparture || '',
        afternoonDeparture: route.schedule?.afternoonDeparture || '',
        distance: route.distance || '',
        estimatedDuration: route.estimatedDuration || '',
      });
    }
  }, [route]);

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
        description: formData.description,
        schedule: {
          morningDeparture: formData.morningDeparture,
          afternoonDeparture: formData.afternoonDeparture,
        },
        distance: parseFloat(formData.distance) || 0,
        estimatedDuration: parseInt(formData.estimatedDuration, 10) || 0,
      };

      if (route) {
        await api.updateRoute(route._id, submitData);
      } else {
        await api.createRoute(submitData);
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
          Route Name *
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input-field"
          rows="3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Morning Departure
          </label>
          <input
            type="text"
            name="morningDeparture"
            value={formData.morningDeparture}
            onChange={handleChange}
            className="input-field"
            placeholder="7:00 AM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Afternoon Departure
          </label>
          <input
            type="text"
            name="afternoonDeparture"
            value={formData.afternoonDeparture}
            onChange={handleChange}
            className="input-field"
            placeholder="3:00 PM"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distance (miles)
          </label>
          <input
            type="number"
            name="distance"
            value={formData.distance}
            onChange={handleChange}
            className="input-field"
            step="0.1"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Est. Duration (mins)
          </label>
          <input
            type="number"
            name="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={handleChange}
            className="input-field"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : route ? 'Update Route' : 'Create Route'}
        </button>
      </div>
    </form>
  );
};

export default RouteForm;

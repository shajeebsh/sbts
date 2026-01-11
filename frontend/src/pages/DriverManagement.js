import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Navbar, Modal, LoadingSpinner } from '../components/common';
import { DriverForm } from '../components/admin';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.getDrivers();
      setDrivers(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedDriver(null);
    setShowModal(true);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleDelete = async (driver) => {
    if (window.confirm(`Are you sure you want to deactivate driver ${driver.name}?`)) {
      try {
        await api.deleteDriver(driver._id);
        fetchDrivers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFormSubmit = () => {
    setShowModal(false);
    fetchDrivers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Driver Management</h1>
          <button onClick={handleCreate} className="btn-primary">
            + Add Driver
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div key={driver._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-lg">
                      {driver.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{driver.name}</h3>
                    <p className="text-sm text-gray-500">{driver.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span>{driver.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Assigned Bus:</span>
                  <span>{driver.assignedBus?.busNumber || 'None'}</span>
                </div>
                {driver.assignedBus && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Bus Status:</span>
                    <span className={`font-medium ${
                      driver.assignedBus.status === 'en-route' ? 'text-blue-600' :
                      driver.assignedBus.status === 'active' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {driver.assignedBus.status}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(driver)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(driver)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {drivers.length === 0 && (
            <div className="col-span-full card text-center py-8 text-gray-500">
              No drivers found. Click "Add Driver" to create one.
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedDriver ? 'Edit Driver' : 'Add New Driver'}
      >
        <DriverForm
          driver={selectedDriver}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default DriverManagement;

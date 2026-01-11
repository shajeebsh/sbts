import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Navbar, Modal, LoadingSpinner } from '../components/common';
import { RouteForm, WaypointForm } from '../components/admin';
import { BusMap } from '../components/map';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showWaypointModal, setShowWaypointModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [expandedRoute, setExpandedRoute] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.getRoutes();
      setRoutes(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = () => {
    setSelectedRoute(null);
    setShowRouteModal(true);
  };

  const handleEditRoute = (route) => {
    setSelectedRoute(route);
    setShowRouteModal(true);
  };

  const handleDeleteRoute = async (route) => {
    if (window.confirm(`Are you sure you want to delete route "${route.name}"?`)) {
      try {
        await api.deleteRoute(route._id);
        fetchRoutes();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAddWaypoint = (route) => {
    setSelectedRoute(route);
    setSelectedWaypoint(null);
    setShowWaypointModal(true);
  };

  const handleEditWaypoint = (route, waypoint) => {
    setSelectedRoute(route);
    setSelectedWaypoint(waypoint);
    setShowWaypointModal(true);
  };

  const handleDeleteWaypoint = async (route, waypoint) => {
    if (window.confirm(`Delete waypoint "${waypoint.name}"?`)) {
      try {
        await api.deleteWaypoint(route._id, waypoint._id);
        fetchRoutes();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleRouteFormSubmit = () => {
    setShowRouteModal(false);
    fetchRoutes();
  };

  const handleWaypointFormSubmit = () => {
    setShowWaypointModal(false);
    fetchRoutes();
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
          <h1 className="text-2xl font-bold text-gray-800">Route Management</h1>
          <button onClick={handleCreateRoute} className="btn-primary">
            + Add Route
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{route.name}</h3>
                    <p className="text-sm text-gray-500">{route.description}</p>
                    <div className="mt-2 text-sm text-gray-600">
                      {route.schedule?.morningDeparture && (
                        <span className="mr-4">AM: {route.schedule.morningDeparture}</span>
                      )}
                      {route.schedule?.afternoonDeparture && (
                        <span>PM: {route.schedule.afternoonDeparture}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRoute(route)}
                      className="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(route)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">
                      Waypoints ({route.waypoints?.length || 0})
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setExpandedRoute(expandedRoute === route._id ? null : route._id)}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        {expandedRoute === route._id ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => handleAddWaypoint(route)}
                        className="text-primary-600 hover:text-primary-800 text-sm"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {expandedRoute === route._id && (
                    <div className="space-y-2 mt-3">
                      {route.waypoints?.sort((a, b) => a.order - b.order).map((waypoint) => (
                        <div
                          key={waypoint._id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-xs font-medium">
                              {waypoint.order}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{waypoint.name}</p>
                              <p className="text-xs text-gray-500">
                                {waypoint.type} {waypoint.estimatedArrival && `- ${waypoint.estimatedArrival}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditWaypoint(route, waypoint)}
                              className="text-primary-600 hover:text-primary-800 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteWaypoint(route, waypoint)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!route.waypoints || route.waypoints.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          No waypoints added yet
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {routes.length === 0 && (
              <div className="card text-center py-8 text-gray-500">
                No routes found. Click "Add Route" to create one.
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Route Map</h2>
            <div className="h-[500px]">
              <BusMap routes={routes} buses={[]} />
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        title={selectedRoute ? 'Edit Route' : 'Add New Route'}
      >
        <RouteForm
          route={selectedRoute}
          onSubmit={handleRouteFormSubmit}
          onCancel={() => setShowRouteModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showWaypointModal}
        onClose={() => setShowWaypointModal(false)}
        title={selectedWaypoint ? 'Edit Waypoint' : 'Add Waypoint'}
      >
        <WaypointForm
          routeId={selectedRoute?._id}
          waypoint={selectedWaypoint}
          onSubmit={handleWaypointFormSubmit}
          onCancel={() => setShowWaypointModal(false)}
        />
      </Modal>
    </div>
  );
};

export default RouteManagement;

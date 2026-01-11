import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Navbar, LoadingSpinner } from '../components/common';
import { BusMap } from '../components/map';
import useBusTracking from '../hooks/useBusTracking';

const AdminDashboard = () => {
  const { busesArray, loading: busLoading } = useBusTracking();
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    totalRoutes: 0,
    totalDrivers: 0,
    totalStudents: 0,
  });
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [busesRes, routesRes, driversRes, studentsRes] = await Promise.all([
        api.getBuses(),
        api.getRoutes(),
        api.getDrivers(),
        api.getStudents(),
      ]);

      const buses = busesRes.data || [];
      const routesData = routesRes.data || [];

      setStats({
        totalBuses: buses.length,
        activeBuses: buses.filter((b) => b.status === 'active' || b.status === 'en-route').length,
        totalRoutes: routesData.length,
        totalDrivers: (driversRes.data || []).length,
        totalStudents: (studentsRes.data || []).length,
      });

      setRoutes(routesData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard title="Total Buses" value={stats.totalBuses} color="blue" />
          <StatCard title="Active Buses" value={stats.activeBuses} color="green" />
          <StatCard title="Routes" value={stats.totalRoutes} color="purple" />
          <StatCard title="Drivers" value={stats.totalDrivers} color="orange" />
          <StatCard title="Students" value={stats.totalStudents} color="pink" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h2 className="text-lg font-semibold mb-4">Live Bus Tracking</h2>
            <div className="h-96">
              {busLoading ? (
                <LoadingSpinner className="h-full" />
              ) : (
                <BusMap buses={busesArray} routes={routes} />
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Bus Status</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {busesArray.map((bus) => (
                <div
                  key={bus._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{bus.busNumber}</p>
                    <p className="text-sm text-gray-500">
                      {bus.driver?.name || 'No driver'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bus.status === 'en-route'
                        ? 'bg-blue-100 text-blue-800'
                        : bus.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : bus.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {bus.status}
                  </span>
                </div>
              ))}
              {busesArray.length === 0 && (
                <p className="text-gray-500 text-center py-4">No buses found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
  };

  return (
    <div className="card">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}>
        <span className="text-white font-bold">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};

export default AdminDashboard;

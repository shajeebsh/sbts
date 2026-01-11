import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Navbar, LoadingSpinner } from '../components/common';
import { BusMap } from '../components/map';
import useBusTracking from '../hooks/useBusTracking';
import { useAuth } from '../context/AuthContext';

const Tracking = () => {
  const { isParent } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const busIdsToTrack = useMemo(() => {
    if (isParent && students.length > 0) {
      return [...new Set(students.filter(s => s.bus?._id).map(s => s.bus._id))];
    }
    return [];
  }, [isParent, students]);

  const { buses, busesArray, loading: busLoading } = useBusTracking(busIdsToTrack);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [studentsRes, routesRes] = await Promise.all([
        api.getStudents(),
        api.getRoutes(),
      ]);
      setStudents(studentsRes.data || []);
      setRoutes(routesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const selectedBus = selectedBusId ? buses[selectedBusId] : null;

  const relevantRoutes = useMemo(() => {
    if (selectedBus?.route) {
      return routes.filter(r => r._id === selectedBus.route._id || r._id === selectedBus.route);
    }
    const studentRouteIds = students.map(s => s.route?._id).filter(Boolean);
    return routes.filter(r => studentRouteIds.includes(r._id));
  }, [selectedBus, routes, students]);

  const getEstimatedArrival = (bus, student) => {
    if (!bus || !student?.route) return null;
    
    const route = routes.find(r => r._id === student.route._id || r._id === student.route);
    if (!route?.waypoints) return null;

    const pickupWaypoint = route.waypoints.find(
      wp => wp.name === student.pickupPoint?.name
    );

    return pickupWaypoint?.estimatedArrival || 'Calculating...';
  };

  const loading = loadingData || busLoading;

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Live Bus Tracking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="h-[500px]">
              <BusMap
                buses={busesArray}
                routes={relevantRoutes}
                selectedBus={selectedBus}
                onBusClick={(bus) => setSelectedBusId(bus._id)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {isParent && students.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">My Students</h2>
                <div className="space-y-3">
                  {students.map((student) => {
                    const studentBus = student.bus?._id ? buses[student.bus._id] : null;
                    const eta = getEstimatedArrival(studentBus, student);

                    return (
                      <div
                        key={student._id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedBusId === student.bus?._id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                        onClick={() => student.bus?._id && setSelectedBusId(student.bus._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.school}</p>
                            <p className="text-sm text-gray-500">Grade: {student.grade}</p>
                          </div>
                          {studentBus && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                studentBus.status === 'en-route'
                                  ? 'bg-blue-100 text-blue-800'
                                  : studentBus.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {studentBus.status}
                            </span>
                          )}
                        </div>

                        {student.bus && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Bus:</span>
                              <span className="font-medium">
                                {studentBus?.busNumber || student.bus.busNumber}
                              </span>
                            </div>
                            {eta && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">ETA:</span>
                                <span className="font-medium text-primary-600">{eta}</span>
                              </div>
                            )}
                            {studentBus?.speed !== undefined && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Speed:</span>
                                <span>{Math.round(studentBus.speed)} mph</span>
                              </div>
                            )}
                          </div>
                        )}

                        {!student.bus && (
                          <p className="mt-2 text-sm text-gray-400">No bus assigned</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedBus && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Bus Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bus Number:</span>
                    <span className="font-medium">{selectedBus.busNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedBus.status === 'en-route'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedBus.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedBus.status}
                    </span>
                  </div>
                  {selectedBus.driver && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Driver:</span>
                      <span>{selectedBus.driver.name}</span>
                    </div>
                  )}
                  {selectedBus.speed !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current Speed:</span>
                      <span>{Math.round(selectedBus.speed)} mph</span>
                    </div>
                  )}
                  {selectedBus.lastUpdated && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Update:</span>
                      <span className="text-sm">
                        {new Date(selectedBus.lastUpdated).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isParent && busesArray.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">All Buses</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {busesArray.map((bus) => (
                    <div
                      key={bus._id}
                      className={`p-2 rounded cursor-pointer ${
                        selectedBusId === bus._id
                          ? 'bg-primary-100'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedBusId(bus._id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{bus.busNumber}</span>
                        <span
                          className={`text-xs ${
                            bus.status === 'en-route'
                              ? 'text-blue-600'
                              : bus.status === 'active'
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {bus.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;

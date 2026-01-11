import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

const useBusTracking = (busIds = []) => {
  const [buses, setBuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBuses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getBuses();
      const busMap = {};
      response.data.forEach((bus) => {
        busMap[bus._id] = {
          ...bus,
          location: bus.currentLocation?.coordinates || [0, 0],
        };
      });
      setBuses(busMap);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  useEffect(() => {
    const handleLocationUpdate = (data) => {
      setBuses((prev) => {
        if (!prev[data.busId]) return prev;
        return {
          ...prev,
          [data.busId]: {
            ...prev[data.busId],
            location: data.location?.coordinates || prev[data.busId].location,
            currentLocation: data.location,
            status: data.status,
            speed: data.speed,
            heading: data.heading,
            lastUpdated: data.timestamp,
          },
        };
      });
    };

    const handleStatusUpdate = (data) => {
      setBuses((prev) => {
        if (!prev[data.busId]) return prev;
        return {
          ...prev,
          [data.busId]: {
            ...prev[data.busId],
            status: data.status,
            lastUpdated: data.timestamp,
          },
        };
      });
    };

    socketService.onBusLocation(handleLocationUpdate);
    socketService.onBusStatus(handleStatusUpdate);

    if (busIds.length > 0) {
      busIds.forEach((id) => socketService.subscribeToBus(id));
    } else {
      socketService.subscribeToAllBuses();
    }

    return () => {
      socketService.offBusLocation();
      socketService.offBusStatus();
      if (busIds.length > 0) {
        busIds.forEach((id) => socketService.unsubscribeFromBus(id));
      } else {
        socketService.unsubscribeFromAllBuses();
      }
    };
  }, [busIds]);

  const getBusesArray = useCallback(() => {
    return Object.values(buses);
  }, [buses]);

  return {
    buses,
    busesArray: getBusesArray(),
    loading,
    error,
    refetch: fetchBuses,
  };
};

export default useBusTracking;

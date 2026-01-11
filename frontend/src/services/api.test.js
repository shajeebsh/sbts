import api from './api';

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
  });

  describe('request', () => {
    it('makes request with correct headers', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await api.request('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('includes auth token when available', async () => {
      localStorage.getItem.mockReturnValue('test-token');
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.request('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('throws error on failed request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error message' }),
      });

      await expect(api.request('/test')).rejects.toThrow('Error message');
    });
  });

  describe('login', () => {
    it('sends correct login request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          token: 'auth-token',
          user: { id: '1', name: 'Test', role: 'parent' },
        }),
      });

      await api.login('test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );
    });

    it('stores token and user in localStorage on success', async () => {
      const mockUser = { id: '1', name: 'Test', role: 'parent' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          token: 'auth-token',
          user: mockUser,
        }),
      });

      await api.login('test@example.com', 'password123');

      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'auth-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });
  });

  describe('logout', () => {
    it('removes token and user from localStorage', () => {
      api.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('bus operations', () => {
    beforeEach(() => {
      localStorage.getItem.mockReturnValue('test-token');
    });

    it('getBuses makes GET request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await api.getBuses();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/buses',
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it('createBus makes POST request with data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      const busData = { busNumber: 'BUS-001', licensePlate: 'ABC123', capacity: 40 };
      await api.createBus(busData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/buses',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(busData),
        })
      );
    });

    it('updateBus makes PUT request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await api.updateBus('123', { capacity: 50 });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/buses/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ capacity: 50 }),
        })
      );
    });

    it('deleteBus makes DELETE request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.deleteBus('123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/buses/123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('route operations', () => {
    beforeEach(() => {
      localStorage.getItem.mockReturnValue('test-token');
    });

    it('addWaypoint makes POST request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      const waypointData = { name: 'Stop 1', coordinates: [-73.98, 40.75], order: 1 };
      await api.addWaypoint('route-123', waypointData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/routes/route-123/waypoints',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(waypointData),
        })
      );
    });

    it('deleteWaypoint makes DELETE request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.deleteWaypoint('route-123', 'waypoint-456');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/routes/route-123/waypoints/waypoint-456',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

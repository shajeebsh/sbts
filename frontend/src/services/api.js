const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async getBuses() {
    return this.request('/buses');
  }

  async getBus(id) {
    return this.request(`/buses/${id}`);
  }

  async createBus(busData) {
    return this.request('/buses', {
      method: 'POST',
      body: JSON.stringify(busData),
    });
  }

  async updateBus(id, busData) {
    return this.request(`/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(busData),
    });
  }

  async deleteBus(id) {
    return this.request(`/buses/${id}`, {
      method: 'DELETE',
    });
  }

  async assignDriverToBus(busId, driverId) {
    return this.request(`/buses/${busId}/assign-driver`, {
      method: 'PUT',
      body: JSON.stringify({ driverId }),
    });
  }

  async assignRouteToBus(busId, routeId) {
    return this.request(`/buses/${busId}/assign-route`, {
      method: 'PUT',
      body: JSON.stringify({ routeId }),
    });
  }

  async getRoutes() {
    return this.request('/routes');
  }

  async getRoute(id) {
    return this.request(`/routes/${id}`);
  }

  async createRoute(routeData) {
    return this.request('/routes', {
      method: 'POST',
      body: JSON.stringify(routeData),
    });
  }

  async updateRoute(id, routeData) {
    return this.request(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(routeData),
    });
  }

  async deleteRoute(id) {
    return this.request(`/routes/${id}`, {
      method: 'DELETE',
    });
  }

  async addWaypoint(routeId, waypointData) {
    return this.request(`/routes/${routeId}/waypoints`, {
      method: 'POST',
      body: JSON.stringify(waypointData),
    });
  }

  async updateWaypoint(routeId, waypointId, waypointData) {
    return this.request(`/routes/${routeId}/waypoints/${waypointId}`, {
      method: 'PUT',
      body: JSON.stringify(waypointData),
    });
  }

  async deleteWaypoint(routeId, waypointId) {
    return this.request(`/routes/${routeId}/waypoints/${waypointId}`, {
      method: 'DELETE',
    });
  }

  async getDrivers() {
    return this.request('/drivers');
  }

  async getDriver(id) {
    return this.request(`/drivers/${id}`);
  }

  async createDriver(driverData) {
    return this.request('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async updateDriver(id, driverData) {
    return this.request(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData),
    });
  }

  async deleteDriver(id) {
    return this.request(`/drivers/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudents() {
    return this.request('/students');
  }

  async getStudent(id) {
    return this.request(`/students/${id}`);
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  async assignBusToStudent(studentId, busId) {
    return this.request(`/students/${studentId}/assign-bus`, {
      method: 'PUT',
      body: JSON.stringify({ busId }),
    });
  }

  async assignRouteToStudent(studentId, routeId) {
    return this.request(`/students/${studentId}/assign-route`, {
      method: 'PUT',
      body: JSON.stringify({ routeId }),
    });
  }
}

const api = new ApiService();
export default api;

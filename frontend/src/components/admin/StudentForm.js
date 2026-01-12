import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentForm = ({ student, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    grade: '',
    school: '',
    parent: '',
    bus: '',
    route: '',
  });
  const [parents, setParents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        studentId: student.studentId || '',
        grade: student.grade || '',
        school: student.school || '',
        parent: student.parent?._id || '',
        bus: student.bus?._id || '',
        route: student.route?._id || '',
      });
    }
    fetchRelatedData();
  }, [student]);

  const fetchRelatedData = async () => {
    try {
      const [busesRes, routesRes, parentsRes] = await Promise.all([
        api.getBuses(),
        api.getRoutes(),
        api.getParents(),
      ]);
      setBuses(busesRes.data || []);
      setRoutes(routesRes.data || []);
      setParents(parentsRes.data || []);
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
        name: formData.name,
        studentId: formData.studentId,
        grade: formData.grade,
        school: formData.school,
        parent: formData.parent,
      };

      if (student) {
        await api.updateStudent(student._id, submitData);
        if (formData.bus && formData.bus !== student.bus?._id) {
          await api.assignBusToStudent(student._id, formData.bus);
        }
        if (formData.route && formData.route !== student.route?._id) {
          await api.assignRouteToStudent(student._id, formData.route);
        }
      } else {
        const created = await api.createStudent(submitData);
        if (formData.bus) {
          await api.assignBusToStudent(created.data._id, formData.bus);
        }
        if (formData.route) {
          await api.assignRouteToStudent(created.data._id, formData.route);
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
          Student Name *
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
          Student ID *
        </label>
        <input
          type="text"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          className="input-field"
          required
          disabled={!!student}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grade *
          </label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School *
          </label>
          <input
            type="text"
            name="school"
            value={formData.school}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parent *
        </label>
        <select
          name="parent"
          value={formData.parent}
          onChange={handleChange}
          className="input-field"
          required
          disabled={!!student}
        >
          <option value="">-- Select Parent --</option>
          {parents.map((parent) => (
            <option key={parent._id} value={parent._id}>
              {parent.name} ({parent.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign Bus
        </label>
        <select
          name="bus"
          value={formData.bus}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">-- Select Bus --</option>
          {buses.map((bus) => (
            <option key={bus._id} value={bus._id}>
              {bus.busNumber}
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
          {loading ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;

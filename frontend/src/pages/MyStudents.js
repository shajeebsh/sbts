import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Navbar, LoadingSpinner } from '../components/common';
import useBusTracking from '../hooks/useBusTracking';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const { buses } = useBusTracking();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingData(true);
      const response = await api.getStudents();
      setStudents(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) {
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Students</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {students.length === 0 ? (
          <div className="card text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Students Enrolled
            </h3>
            <p className="text-gray-500 mb-4">
              Contact your school administrator to enroll your children in the bus tracking system.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => {
              const studentBus = student.bus?._id ? buses[student.bus._id] : null;

              return (
                <div key={student._id} className="card">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-700 font-bold text-xl">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-gray-500 text-sm">{student.school}</p>
                      <p className="text-gray-400 text-sm">Grade: {student.grade}</p>
                      <p className="text-gray-400 text-sm">ID: {student.studentId}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bus:</span>
                      <span className="font-medium">
                        {student.bus?.busNumber || 'Not assigned'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Route:</span>
                      <span className="font-medium">
                        {student.route?.name || 'Not assigned'}
                      </span>
                    </div>

                    {studentBus && (
                      <>
                        <div className="flex justify-between text-sm items-center">
                          <span className="text-gray-500">Bus Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              studentBus.status === 'en-route'
                                ? 'bg-blue-100 text-blue-800'
                                : studentBus.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : studentBus.status === 'maintenance'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {studentBus.status}
                          </span>
                        </div>

                        {studentBus.driver && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Driver:</span>
                            <span>{studentBus.driver.name}</span>
                          </div>
                        )}
                      </>
                    )}

                    {student.pickupPoint?.name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Pickup:</span>
                        <span>{student.pickupPoint.name}</span>
                      </div>
                    )}
                  </div>

                  {student.bus && (
                    <div className="mt-4">
                      <Link
                        to="/tracking"
                        className="btn-primary w-full text-center block"
                      >
                        Track Bus
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStudents;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isParent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="font-bold text-xl">SBTS</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {isAdmin && (
              <>
                <Link to="/admin" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                <Link to="/admin/buses" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  Buses
                </Link>
                <Link to="/admin/routes" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  Routes
                </Link>
                <Link to="/admin/drivers" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  Drivers
                </Link>
                <Link to="/admin/students" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  Students
                </Link>
              </>
            )}
            {isParent && (
              <>
                <Link to="/tracking" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  Track Bus
                </Link>
                <Link to="/my-students" className="hover:bg-primary-700 px-3 py-2 rounded-md">
                  My Students
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm hidden sm:block">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

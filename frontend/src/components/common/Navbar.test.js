import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Navbar from './Navbar';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = (ui, { user = null } = {}) => {
  if (user) {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(user);
      if (key === 'token') return 'mock-token';
      return null;
    });
  }

  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.getItem.mockClear();
  });

  it('renders the SBTS logo', () => {
    renderWithProviders(<Navbar />, {
      user: { name: 'Test User', role: 'parent' },
    });
    expect(screen.getByText('SBTS')).toBeInTheDocument();
  });

  it('shows admin navigation links for admin users', () => {
    renderWithProviders(<Navbar />, {
      user: { name: 'Admin User', role: 'admin' },
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Buses')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
    expect(screen.getByText('Drivers')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
  });

  it('shows parent navigation links for parent users', () => {
    renderWithProviders(<Navbar />, {
      user: { name: 'Parent User', role: 'parent' },
    });

    expect(screen.getByText('Track Bus')).toBeInTheDocument();
    expect(screen.getByText('My Students')).toBeInTheDocument();
  });

  it('displays user name and role', () => {
    renderWithProviders(<Navbar />, {
      user: { name: 'Test User', role: 'parent' },
    });

    expect(screen.getByText('Test User (parent)')).toBeInTheDocument();
  });

  it('has a logout button', () => {
    renderWithProviders(<Navbar />, {
      user: { name: 'Test User', role: 'parent' },
    });

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls logout and navigates on logout click', () => {
    renderWithProviders(<Navbar />, {
      user: { name: 'Test User', role: 'parent' },
    });

    fireEvent.click(screen.getByText('Logout'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

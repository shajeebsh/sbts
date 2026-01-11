import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders status text', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('applies correct class for active status', () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByText('active');
    expect(badge).toHaveClass('status-active');
  });

  it('applies correct class for inactive status', () => {
    render(<StatusBadge status="inactive" />);
    const badge = screen.getByText('inactive');
    expect(badge).toHaveClass('status-inactive');
  });

  it('applies correct class for en-route status', () => {
    render(<StatusBadge status="en-route" />);
    const badge = screen.getByText('en-route');
    expect(badge).toHaveClass('status-en-route');
  });

  it('applies correct class for maintenance status', () => {
    render(<StatusBadge status="maintenance" />);
    const badge = screen.getByText('maintenance');
    expect(badge).toHaveClass('status-maintenance');
  });

  it('applies default class for unknown status', () => {
    render(<StatusBadge status="unknown" />);
    const badge = screen.getByText('unknown');
    expect(badge).toHaveClass('status-inactive');
  });
});

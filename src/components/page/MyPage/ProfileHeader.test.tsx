import { render, screen } from '@testing-library/react';
import ProfileHeader from './ProfileHeader';

describe('ProfileHeader', () => {
  it('shows displayName and email but does not show username', () => {
    const user = {
      id: 'u1',
      username: 'alice_science',
      displayName: 'Alice Smith',
      email: 'alice@example.com',
      role: 'user',
    } as any;

    render(<ProfileHeader user={user} onLogout={() => {}} onNavigateAdmin={() => {}} />);

    // Display name should be visible
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();

    // Email should be visible
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();

    // Username (e.g., @alice_science or raw username) should NOT be shown in header
    expect(screen.queryByText('@alice_science')).toBeNull();
    expect(screen.queryByText('alice_science')).toBeNull();

    // Avatar should render the first letter of displayName
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
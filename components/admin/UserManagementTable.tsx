'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import UserFormModal from './UserFormModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  isActive: number;
  pointsBalance: number;
  createdAt: string;
}

export default function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.data);
      } else {
        setToast({ message: data.error || 'Failed to fetch users', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'An error occurred while fetching users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ message: 'User permanently deleted', type: 'success' });
        fetchUsers();
      } else {
        setToast({ message: data.error || 'Failed to delete user', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'An error occurred while deleting the user', type: 'error' });
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: user.isActive === 0 }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          message: `User ${data.data.isActive ? 'activated' : 'deactivated'} successfully`,
          type: 'success',
        });
        fetchUsers();
      } else {
        setToast({ message: data.error || 'Failed to toggle user status', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'An error occurred', type: 'error' });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      case 'hr':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">User Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Manage all users, their access levels, and account status</p>
          </div>
          <Button variant="primary" onClick={handleCreateClick}>
            + Create User
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">{user.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          user.isActive === 1
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {user.isActive === 1 ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(user.id, user.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

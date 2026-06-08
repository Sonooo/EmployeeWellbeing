'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { Toast } from '@/components/ui/Toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  isActive: number;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'HR',
  'Finance',
  'Operations',
  'Product',
  'Design',
  'People & Culture',
];

const ROLES = [
  { value: 'employee', label: 'Employee' },
  { value: 'hr', label: 'HR Representative' },
  { value: 'admin', label: 'Administrator' },
];

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
];

export default function UserFormModal({ isOpen, onClose, user, onSuccess }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    status: 'approved',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        department: user.department,
        status: user.status,
        isActive: user.isActive === 1,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: 'Engineering',
        status: 'approved',
        isActive: true,
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = user ? 'PATCH' : 'POST';
      const url = user ? `/api/admin/users/${user.id}` : '/api/admin/users';

      const payload = user
        ? {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            department: formData.department,
            status: formData.status,
            isActive: formData.isActive,
            ...(formData.password && { password: formData.password }),
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save user');
      }

      setToast({
        message: user ? 'User updated successfully' : 'User created successfully',
        type: 'success',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
        setToast(null);
      }, 1500);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'An error occurred',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Create New User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter user name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password {user && '(leave blank to keep current password)'}
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
              required={!user}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={ROLES}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <Select
                name="department"
                value={formData.department}
                onChange={handleChange}
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={STATUSES}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

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

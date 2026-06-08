import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Users, Settings } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your application settings and users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  User Management
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Create, edit, delete, and manage user accounts. Control user access levels and account status.
                </p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <Link href="/admin/users">
              <Button variant="primary" fullWidth>
                Manage Users
              </Button>
            </Link>
          </div>

          {/* Settings Card (Placeholder) */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Settings
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Configure application settings and preferences.
                </p>
              </div>
              <Settings className="h-8 w-8 text-slate-400" />
            </div>
            <Button variant="secondary" fullWidth disabled>
              Coming Soon
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Total Users
            </h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              View in User Management
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Active Users
            </h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              View in User Management
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Pending Approvals
            </h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              View in User Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

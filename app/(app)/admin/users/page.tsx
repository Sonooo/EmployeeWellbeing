import UserManagementTable from '@/components/admin/UserManagementTable';

export default function UsersManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <UserManagementTable />
      </div>
    </div>
  );
}

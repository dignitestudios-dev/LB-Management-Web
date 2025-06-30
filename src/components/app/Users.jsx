import React from "react";
import { useUsers } from "../../hooks/api/Get"; // Adjust path if needed

const Users = () => {
  const { data: users, loading } = useUsers("/users");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : users?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white rounded-xl shadow">
            <thead className="bg-blue-100 text-gray-800">
              <tr>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border">Email</th>
                <th className="px-4 py-3 border">Employee Code</th>
                <th className="px-4 py-3 border">Department</th>
                <th className="px-4 py-3 border">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50">
                  <td className="border px-4 py-2">{user.name}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.employeeCode}</td>
                  <td className="border px-4 py-2">{user.department?.name || "—"}</td>
                  <td className="border px-4 py-2">{user.role?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No users found.</p>
      )}
    </div>
  );
};

export default Users;

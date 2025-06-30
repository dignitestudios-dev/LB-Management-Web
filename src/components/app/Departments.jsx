import React, { useEffect, useState } from 'react';
import { useUsers } from '../../hooks/api/Get'; // Using the same custom hook

const Departments = () => {
  const { data: departments, loading } = useUsers("/departments");

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold text-blue-600 mb-4">All Departments</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <table className="w-full table-auto border border-gray-200 rounded-lg">
          <thead className="bg-blue-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Department Name</th>
              <th className="px-4 py-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <tr key={dept._id} className="text-gray-800 hover:bg-gray-50">
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border font-medium">{dept.name}</td>
                <td className="px-4 py-2 border text-sm">
                  {new Date(dept.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Departments;

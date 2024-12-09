import React, { useState, useEffect } from "react";
import backendAxios from "../utils/backendAxios";
import { useToast } from "../context/ToastContext";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [userPlans, setUserPlans] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "User",
    status: "allow",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, selectedRole]);

  // API Functions
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await backendAxios.get("/admin", {
        params: {
          search: searchTerm,
          role: selectedRole,
        },
      });
      setUsers(data.data);
    } catch (error) {
      setError(error.response.data.message);
      console.error("Error fetching users:", error);
      showToast(error.response.data.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPlans = async (userId) => {
    setIsLoading(true);
    try {
      const response = await backendAxios.get(`/admin/${userId}/plans`);
      setUserPlans((prev) => ({
        ...prev,
        [userId]: response.data.data,
      }));
    } catch (error) {
      console.error("Error fetching user plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal for adding new user
  const handleAddNew = () => {
    setModalMode("add");
    setFormData({
      email: "",
      password: "",
      role: "User",
      status: "allow",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing user
  const handleEdit = (user) => {
    setModalMode("edit");
    setCurrentUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      if (modalMode === "add") {
        // Add new user
        await backendAxios.post("/admin", formData);
        showToast("User added successfully", "success");
      } else {
        // Edit existing user
        await backendAxios.put(`/admin/${currentUser.id}`, formData);
        showToast("User updated successfully", "success");
      }

      setIsModalOpen(false);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error saving user:", error);
      showToast(error.response.data.message, "error");
    }
  };

  // Handle delete user
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await backendAxios.delete(`/admin/${userId}`);
        fetchUsers(); // Refresh user list
      } catch (error) {
        console.error("Error deleting user:", error);
        // Add error handling/notification here
      }
    }
  };

  // Add this modal component inside Admin component
  const UserModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900">
              {modalMode === "add" ? "Add New User" : "Edit User"}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 text-left">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={formData.email}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {modalMode === "add" && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    defaultValue={formData.password}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Role
                </label>
                <select
                  name="role"
                  defaultValue={formData.role}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={formData.status}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="allow">allow</option>
                  <option value="block">block</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === "add" ? "Add User" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add New User
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Plan
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage / Limits
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No users found matching your search criteria
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "allow"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {userPlans[user.id] ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {userPlans[user.id].planType}
                        </div>
                        <div className="text-gray-500">
                          Expires:{" "}
                          {userPlans[user.id].expiryDate
                            ? new Date(
                                userPlans[user.id].expiryDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fetchUserPlans(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Load Plan Details
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {userPlans[user.id] && (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Workspaces:</span>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (userPlans[user.id].workSpaceUsed /
                                    userPlans[user.id].workSpaceLimit) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {userPlans[user.id].workSpaceUsed} /{" "}
                            {userPlans[user.id].workSpaceLimit}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Tasks:</span>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (userPlans[user.id].tasksUsed /
                                    userPlans[user.id].tasksLimit) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {userPlans[user.id].tasksUsed} /{" "}
                            {userPlans[user.id].tasksLimit}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Apps:</span>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-green-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (userPlans[user.id].appsUsed /
                                    userPlans[user.id].appsLimit) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {userPlans[user.id].appsUsed} /{" "}
                            {userPlans[user.id].appsLimit}
                          </span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{users.length}</span>/
          <span className="font-medium">{users.length}</span> users
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Previous
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>

      <UserModal />
    </div>
  );
};

export default Admin;

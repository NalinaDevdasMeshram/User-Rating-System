import { useEffect, useState } from "react";
import api from "../../services/api";

interface Metrics {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: "ADMIN" | "USER" | "STORE_OWNER";
}

interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
  };
}

interface MetricsResponse {
  success: boolean;
  data: Metrics;
}

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showStoreForm, setShowStoreForm] = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });

  const [storeError, setStoreError] = useState("");
  const [storeSuccess, setStoreSuccess] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [metricsRes, usersRes] = await Promise.all([
          api.get<MetricsResponse>("/admin/metrics"),
          api.get<UsersResponse>("/admin/users"),
        ]);

        setMetrics(metricsRes.data.data);
        setUsers(usersRes.data.data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.address} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading) return <p className="p-8">Loading dashboard...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!metrics) return <p className="p-8">No dashboard data available.</p>;

  const cards = [
    { title: "Total Users", value: metrics.totalUsers },
    { title: "Total Stores", value: metrics.totalStores },
    { title: "Total Ratings", value: metrics.totalRatings },
  ];
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await api.post("/admin/users", formData);

      setUsers((previousUsers) => [...previousUsers, response.data.data]);

      if (metrics) {
        setMetrics({
          ...metrics,
          totalUsers: metrics.totalUsers + 1,
        });
      }

      setSuccessMessage("User created successfully!");

      setFormData({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });

      setShowForm(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Unable to create user.");
    }
  };

  const handleCreateStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStoreError("");
    setStoreSuccess("");

    try {
      const response = await api.post("/admin/stores", storeForm);

      setStoreSuccess("Store created successfully!");

      setMetrics((previous) =>
        previous
          ? { ...previous, totalStores: previous.totalStores + 1 }
          : previous,
      );

      setStoreForm({
        name: "",
        email: "",
        address: "",
        ownerId: "",
      });

      setShowStoreForm(false);

      console.log("Created store:", response.data.data);
    } catch (err: any) {
      setStoreError(err.response?.data?.message || "Unable to create store.");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="mt-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Create User"}
        </button>

        {successMessage && (
          <p className="mt-3 text-green-600">{successMessage}</p>
        )}

        {formError && <p className="mt-3 text-red-600">{formError}</p>}

        {showForm && (
          <form
            onSubmit={handleCreateUser}
            className="mt-5 grid grid-cols-1 gap-4 rounded-xl bg-white p-6 shadow md:grid-cols-2"
          >
            <input
              required
              minLength={20}
              maxLength={60}
              placeholder="Full Name (20–60 characters)"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-lg border p-3"
            />

            <input
              required
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="rounded-lg border p-3"
            />

            <input
              required
              type="password"
              minLength={8}
              maxLength={16}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="rounded-lg border p-3"
            />

            <input
              required
              maxLength={400}
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="rounded-lg border p-3"
            />

            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "USER" | "STORE_OWNER",
                })
              }
              className="rounded-lg border p-3"
            >
              <option value="USER">USER</option>
              <option value="STORE_OWNER">STORE_OWNER</option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-green-600 p-3 text-white hover:bg-green-700"
            >
              Create User
            </button>
          </form>
        )}
      </div>
      <p className="mt-2 text-gray-600">
        Manage users, stores and application metrics.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-gray-500">{card.title}</h2>
            <p className="mt-3 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-white p-6 shadow">
        <div className="mt-8">
          <button
            onClick={() => setShowStoreForm(!showStoreForm)}
            className="rounded-lg bg-purple-600 px-5 py-3 text-white hover:bg-purple-700"
          >
            {showStoreForm ? "Cancel" : "+ Create Store"}
          </button>

          {storeSuccess && (
            <p className="mt-3 text-green-600">{storeSuccess}</p>
          )}

          {storeError && <p className="mt-3 text-red-600">{storeError}</p>}

          {showStoreForm && (
            <form
              onSubmit={handleCreateStore}
              className="mt-5 grid grid-cols-1 gap-4 rounded-xl bg-white p-6 shadow md:grid-cols-2"
            >
              <input
                required
                maxLength={100}
                placeholder="Store Name"
                value={storeForm.name}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, name: e.target.value })
                }
                className="rounded-lg border p-3"
              />

              <input
                required
                type="email"
                placeholder="Store Email"
                value={storeForm.email}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, email: e.target.value })
                }
                className="rounded-lg border p-3"
              />

              <input
                required
                maxLength={400}
                placeholder="Store Address"
                value={storeForm.address}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, address: e.target.value })
                }
                className="rounded-lg border p-3"
              />

              <select
                required
                value={storeForm.ownerId}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, ownerId: e.target.value })
                }
                className="rounded-lg border p-3"
              >
                <option value="">Select Store Owner</option>

                {users
                  .filter((user) => user.role === "STORE_OWNER")
                  .map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
              </select>

              <button
                type="submit"
                className="rounded-lg bg-green-600 p-3 text-white hover:bg-green-700"
              >
                Create Store
              </button>
            </form>
          )}
        </div>

        <h2 className="mb-5 text-2xl font-bold">Manage Users</h2>

        <input
          type="text"
          placeholder="Search by name, email, address or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-5 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Address</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.address}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-5 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredUsers.length} users
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;

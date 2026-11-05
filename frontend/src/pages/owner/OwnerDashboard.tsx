import { useEffect, useState } from "react";
import api from "../../services/api";
import type { OwnerDashboardResponse } from "../../types/owner";

const OwnerDashboard = () => {
  const [dashboard, setDashboard] = useState<
    OwnerDashboardResponse["data"] | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response =
          await api.get<OwnerDashboardResponse>("/owner/dashboard");

        setDashboard(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load owner dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <p className="p-8 text-center">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-red-600">{error}</p>;
  }

  if (!dashboard) {
    return <p className="p-8">No dashboard data available.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          Store Owner Dashboard
        </h1>

        <p className="mb-8 text-gray-600">
          Welcome! Here's your store performance.
        </p>

        {/* Store details */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-semibold">{dashboard.store.name}</h2>

          <p className="text-gray-600">Email: {dashboard.store.email}</p>

          <p className="mt-1 text-gray-600">
            Address: {dashboard.store.address}
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">Average Rating</p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-500">
              ★ {dashboard.averageRating.toFixed(1)} / 5
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">Total Ratings</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {dashboard.totalRatings}
            </h2>
          </div>
        </div>

        {/* Customer ratings */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold">Customer Ratings</h2>

          {dashboard.ratings.length === 0 ? (
            <p className="text-gray-500">No customer ratings received yet.</p>
          ) : (
            <div className="space-y-4">
              {dashboard.ratings.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {item.user.name}
                      </h3>

                      <p className="text-sm text-gray-500">{item.user.email}</p>
                    </div>

                    <div className="text-yellow-500">
                      {"★".repeat(item.rating)}
                      {"☆".repeat(5 - item.rating)}
                      <span className="ml-2 text-gray-700">
                        {item.rating}/5
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

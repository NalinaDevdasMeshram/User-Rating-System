import { useEffect, useState } from "react";
import api from "../../services/api";
import type { MyRating, MyRatingsResponse } from "../../types/rating";

const MyRatings = () => {
  const [ratings, setRatings] = useState<MyRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyRatings = async () => {
      try {
        const response = await api.get<MyRatingsResponse>(
          "/ratings/my-ratings",
        );
        setRatings(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your ratings.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyRatings();
  }, []);

  if (loading) {
    return <p className="p-8 text-center">Loading your ratings...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">My Ratings</h1>

        <p className="mb-6 text-gray-600">
          Total ratings submitted: {ratings.length}
        </p>

        {ratings.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              You haven't submitted any ratings yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {ratings.map((item) => (
              <div key={item.id} className="rounded-xl bg-white p-6 shadow">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">
                  {item.store.name}
                </h2>

                <p className="mb-4 text-sm text-gray-500">
                  {item.store.address}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </span>

                  <span className="font-medium text-gray-700">
                    {item.rating}/5
                  </span>
                </div>

                <p className="mt-4 text-xs text-gray-400">
                  Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRatings;

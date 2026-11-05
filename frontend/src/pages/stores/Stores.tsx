import { useEffect, useState } from "react";
import api from "../../services/api";
import type { Store, StoreResponse } from "../../types/stores";
import { Link } from "react-router-dom";

const Stores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<StoreResponse>("/stores", {
          params: {
            search: debouncedSearch,
            sortBy,
            order,
            page,
            limit: 10,
          },
        });

        setStores(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        console.error("Store fetch error:", err);
        setError("Unable to load stores. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [debouncedSearch, sortBy, order, page]);

  // Submit or update rating
  const handleRating = async (storeId: string) => {
    const rating = ratings[storeId];

    if (!rating) {
      setMessage("Please select a rating first.");
      return;
    }

    try {
      setMessage("");

      await api.post("/ratings", {
        storeId,
        rating,
      });

      setMessage("Rating submitted successfully!");

      // Refresh store ratings
      const response = await api.get<StoreResponse>("/stores", {
        params: {
          search: debouncedSearch,
          sortBy,
          order,
          page,
          limit: 10,
        },
      });

      setStores(response.data.data);
    } catch (err) {
      console.error("Rating error:", err);
      setMessage("Unable to submit rating. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Explore Stores</h1>
          <p className="text-gray-500 mt-2">
            Discover stores and share your experience.
          </p>
        </div>
        <div className="mb-6 flex gap-4">
          <Link
            to="/stores"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Browse Stores
          </Link>

          <Link
            to="/my-ratings"
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800"
          >
            My Ratings
          </Link>
        </div>
        {/* Search and sorting */}
        <div className="bg-white p-5 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by store name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg p-3 w-full"
          />

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg p-3"
          >
            <option value="name">Sort by Name</option>
            <option value="averageRating">Sort by Rating</option>
          </select>

          <select
            value={order}
            onChange={(e) => {
              setOrder(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg p-3"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Messages */}
        {message && (
          <p className="mb-4 p-3 rounded-lg bg-blue-100 text-blue-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">{error}</p>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-center py-10 text-gray-600">Loading stores...</p>
        )}

        {/* Store cards */}
        {!loading && stores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <h2 className="text-xl font-bold text-gray-800">
                  {store.name}
                </h2>

                <p className="text-gray-500 text-sm mt-2">{store.address}</p>

                <p className="text-gray-500 text-sm mt-1">{store.email}</p>

                <div className="mt-4 border-t pt-4">
                  <p className="font-semibold text-gray-700">
                    Average Rating: ⭐ {store.averageRating.toFixed(1)}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Total Ratings: {store.totalRatings}
                  </p>
                </div>

                <div className="mt-5">
                  <label className="block font-medium mb-2">
                    Rate this store
                  </label>

                  <select
                    value={ratings[store.id] || ""}
                    onChange={(e) =>
                      setRatings((previous) => ({
                        ...previous,
                        [store.id]: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value} Star{value > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleRating(store.id)}
                    className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Submit Rating
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && stores.length === 0 && !error && (
          <p className="text-center py-10 text-gray-500">No stores found.</p>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((previous) => previous - 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
            >
              Previous
            </button>

            <span className="font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((previous) => previous + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;

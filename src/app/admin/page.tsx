"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    checkSession();
    fetchBookings();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "GET",
      });
      if (!response.ok) {
        router.push("/admin/login");
      }
    } catch (error) {
      router.push("/admin/login");
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings");
      const data = await response.json();
      if (data.success) {
        setBookings(data.results);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter !== "all" && booking.status !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        booking.reference?.toLowerCase().includes(searchLower) ||
        booking.customerName?.toLowerCase().includes(searchLower) ||
        booking.phone?.includes(search)
      );
    }
    return true;
  });

  const statusCounts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-deep-purple">SkyTouchClean Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session?.user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-600">Pending Review</h3>
            <p className="text-2xl font-bold text-deep-purple">
              {statusCounts["PENDING_REVIEW"] || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-600">Awaiting Confirmation</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {statusCounts["AWAITING_CUSTOMER_CONFIRMATION"] || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-600">Confirmed</h3>
            <p className="text-2xl font-bold text-teal">
              {statusCounts["CONFIRMED"] || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-600">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">
              {statusCounts["IN_PROGRESS"] || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="AWAITING_CUSTOMER_CONFIRMATION">
                Awaiting Confirmation
              </option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              type="text"
              placeholder="Search by reference, name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded flex-1"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{booking.reference}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-sm text-gray-600">{booking.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {booking.serviceType === "LAUNDRY" ? "Laundry" : booking.serviceType}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === "PENDING_REVIEW"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "COMPLETED"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${booking._id}`}
                        className="text-teal hover:underline text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBookings.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No bookings found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

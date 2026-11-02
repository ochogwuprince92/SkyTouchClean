"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "laundry" | "cleaning" | "fumigation">("all");

  const stats = {
    new: 5,
    pending: 12,
    confirmed: 8,
    inProgress: 3,
    completed: 45,
    cancelled: 2,
  };

  const bookings = [
    {
      id: "1",
      reference: "STC-LAU-ABC12345",
      type: "laundry",
      customerName: "John Doe",
      phone: "08123456789",
      status: "PENDING_REVIEW",
      date: "2025-01-15",
      total: 5000,
    },
    {
      id: "2",
      reference: "STC-CLA-DEF67890",
      type: "cleaning",
      customerName: "Jane Smith",
      phone: "08198765432",
      status: "CONFIRMED",
      date: "2025-01-16",
      total: 25000,
    },
    {
      id: "3",
      reference: "STC-FUM-GHI12345",
      type: "fumigation",
      customerName: "Mike Johnson",
      phone: "08134567890",
      status: "PENDING_REVIEW",
      date: "2025-01-17",
      total: 0,
    },
    {
      id: "4",
      reference: "STC-LAU-JKL67890",
      type: "laundry",
      customerName: "Sarah Williams",
      phone: "08123456789",
      status: "IN_PROGRESS",
      date: "2025-01-14",
      total: 3000,
    },
    {
      id: "5",
      reference: "STC-CLA-MNO12345",
      type: "cleaning",
      customerName: "David Brown",
      phone: "08198765432",
      status: "COMPLETED",
      date: "2025-01-13",
      total: 7000,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.type === activeTab);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-deep-purple">Admin Dashboard</h1>
            <Link
              href="/admin/login"
              className="text-sm text-gray-600 hover:text-deep-purple"
            >
              Logout
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600">New</p>
              <p className="text-2xl font-bold text-deep-purple">{stats.new}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            {["all", "laundry", "cleaning", "fumigation"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-semibold capitalize ${
                  activeTab === tab
                    ? "text-teal border-b-2 border-teal"
                    : "text-gray-600 hover:text-deep-purple"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by reference, name, or phone..."
              className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-deep-purple text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Reference</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Customer</th>
                    <th className="px-6 py-4 text-left">Phone</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{booking.reference}</td>
                      <td className="px-6 py-4 capitalize">{booking.type}</td>
                      <td className="px-6 py-4">{booking.customerName}</td>
                      <td className="px-6 py-4">{booking.phone}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">{booking.date}</td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {booking.total > 0 ? `₦${booking.total.toLocaleString()}` : "Quote"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-teal hover:underline font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

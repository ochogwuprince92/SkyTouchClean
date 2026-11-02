"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function BookingDetail({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const booking = {
    id: params.id,
    reference: "STC-LAU-ABC12345",
    type: "laundry",
    customerName: "John Doe",
    phone: "08123456789",
    email: "john@example.com",
    pickupAddress: "123 Main Street, Lagos",
    deliveryAddress: "123 Main Street, Lagos",
    preferredDate: "2025-01-15",
    preferredTime: "10:00",
    status: status,
    total: 5000,
    paymentStatus: "UNPAID",
    items: [
      { name: "Trousers and Shirt", quantity: 2, price: 1000 },
      { name: "Native Wears", quantity: 1, price: 1500 },
      { name: "Bedspread", quantity: 1, price: 1500 },
    ],
    customerNotes: "Please handle with care. White items only.",
    internalNotes: "",
    createdAt: "2025-01-10T10:00:00Z",
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link
              href="/admin/dashboard"
              className="text-teal hover:underline mb-4 inline-block"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-deep-purple mb-2">
                      {booking.reference}
                    </h1>
                    <p className="text-gray-600 capitalize">{booking.type} Booking</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      status
                    )}`}
                  >
                    {status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-semibold">{booking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{booking.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{booking.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items/Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-deep-purple">Items</h2>
                <div className="space-y-3">
                  {booking.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-2 border-b last:border-0"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-semibold">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 font-bold text-lg border-t">
                    <span>Total</span>
                    <span className="text-deep-purple">
                      ₦{booking.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-deep-purple">Schedule</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Pickup/Service Date</p>
                    <p className="font-semibold">{booking.preferredDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preferred Time</p>
                    <p className="font-semibold">{booking.preferredTime}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{booking.pickupAddress}</p>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {booking.customerNotes && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4 text-deep-purple">
                    Customer Notes
                  </h2>
                  <p className="text-gray-700">{booking.customerNotes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Update */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-deep-purple">
                  Update Status
                </h2>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal mb-4"
                >
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button className="w-full bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700">
                  Update Status
                </button>
              </div>

              {/* Payment Status */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-deep-purple">
                  Payment Status
                </h2>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Current Status:</span>
                  <span className="font-semibold text-yellow-600">
                    {booking.paymentStatus}
                  </span>
                </div>
                <button className="w-full bg-deep-purple text-white px-6 py-3 rounded-md font-semibold hover:bg-deep-purple-700">
                  View Payment Details
                </button>
              </div>

              {/* Internal Notes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-deep-purple">
                  Internal Notes
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal mb-4"
                  placeholder="Add internal notes..."
                />
                <button className="w-full bg-teal text-white px-6 py-3 rounded-md font-semibold hover:bg-teal-700">
                  Save Notes
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-deep-purple">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 border rounded-md hover:bg-gray-50 text-left">
                    📞 Call Customer
                  </button>
                  <button className="w-full px-4 py-3 border rounded-md hover:bg-gray-50 text-left">
                    💬 Send WhatsApp
                  </button>
                  <button className="w-full px-4 py-3 border rounded-md hover:bg-gray-50 text-left">
                    ✉️ Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

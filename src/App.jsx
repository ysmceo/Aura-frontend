import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import BookingsSection from "@/components/admin/sections/BookingsSection";
import MessagesSection from "@/components/admin/sections/MessagesSection";
import OrdersSection from "@/components/admin/sections/OrdersSection";
import OverviewSection from "@/components/admin/sections/OverviewSection";
import ProductsSection from "@/components/admin/sections/ProductsSection";
import SettingsSection from "@/components/admin/sections/SettingsSection";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Book from "@/pages/Book";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import OrderProducts from "@/pages/OrderProducts";
import TrackBooking from "@/pages/TrackBooking";
import TrackOrder from "@/pages/TrackOrder";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/order-products" element={<OrderProducts />} />
        <Route path="/track-booking" element={<TrackBooking />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewSection />} />
          <Route path="bookings" element={<BookingsSection />} />
          <Route path="orders" element={<OrdersSection />} />
          <Route path="messages" element={<MessagesSection />} />
          <Route path="products" element={<ProductsSection />} />
          <Route path="settings" element={<SettingsSection />} />
        </Route>
        <Route path="/dashboard/*" element={<Navigate to="/admin/overview" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

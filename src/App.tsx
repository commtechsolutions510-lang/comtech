import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminLocations } from './pages/admin/AdminLocations';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Services } from './pages/Services';
import { Locations } from './pages/Locations';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Login } from './pages/Login';
import { Account } from './pages/Account';
import { OrderDetail } from './pages/OrderDetail';
import { NotFound } from './pages/NotFound';
import { useAdminAuth } from './hooks/useAdminAuth';

function AdminProtectedRoute() {
  const status = useAdminAuth();
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (status === 'not_authenticated') {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/locations" element={<AdminLocations />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
            </Route>
          </Route>

          {/* Customer-facing Routes */}
          <Route path="/" element={<><Navbar /><main className="flex-1"><Home /></main><Footer /></>} />
          <Route path="/about" element={<><Navbar /><main className="flex-1"><About /></main><Footer /></>} />
          <Route path="/products" element={<><Navbar /><main className="flex-1"><Shop /></main><Footer /></>} />
          <Route path="/products/:slug" element={<><Navbar /><main className="flex-1"><ProductDetail /></main><Footer /></>} />
          <Route path="/services" element={<><Navbar /><main className="flex-1"><Services /></main><Footer /></>} />
          <Route path="/locations" element={<><Navbar /><main className="flex-1"><Locations /></main><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><main className="flex-1"><Contact /></main><Footer /></>} />
          <Route path="/cart" element={<><Navbar /><main className="flex-1"><Cart /></main><Footer /></>} />
          <Route path="/checkout" element={<><Navbar /><main className="flex-1"><Checkout /></main><Footer /></>} />
          <Route path="/order-confirmation" element={<><Navbar /><main className="flex-1"><OrderConfirmation /></main><Footer /></>} />
          <Route path="/login" element={<><Navbar /><main className="flex-1"><Login /></main><Footer /></>} />
          <Route path="/account" element={<><Navbar /><main className="flex-1"><Account /></main><Footer /></>} />
          <Route path="/account/orders" element={<><Navbar /><main className="flex-1"><Account /></main><Footer /></>} />
          <Route path="/account/orders/:id" element={<><Navbar /><main className="flex-1"><OrderDetail /></main><Footer /></>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

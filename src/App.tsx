import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminInventory />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCustomers />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminServices />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/locations" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminLocations />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminNotifications />
              </AdminLayout>
            </ProtectedRoute>
          } />

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

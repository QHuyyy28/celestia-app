import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import OrderManagement from './pages/OrderManagement';
import UserManagement from './pages/UserManagement';
import BlogManagement from './pages/BlogManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

// Component bảo vệ route admin
const PrivateAdminRoute = ({ element, user, loading }) => {
  if (loading) return <div>Đang tải...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return element;
};

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  return (
    <Router>
      <AuthProvider setUser={setUser} setLoading={setLoading}>
        <CartProvider>
          <WishlistProvider>
            <div className="d-flex flex-column min-vh-100">
              <Navbar />
              <main className="flex-grow-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/login" element={<Login setUser={setUser} />} />
                  <Route path="/register" element={<Register setUser={setUser} />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={<PrivateAdminRoute element={<AdminDashboard />} user={user} loading={loading} />} />
                  <Route path="/admin/products" element={<PrivateAdminRoute element={<ProductManagement />} user={user} loading={loading} />} />
                  <Route path="/admin/categories" element={<PrivateAdminRoute element={<CategoryManagement />} user={user} loading={loading} />} />
                  <Route path="/admin/orders" element={<PrivateAdminRoute element={<OrderManagement />} user={user} loading={loading} />} />
                  <Route path="/admin/users" element={<PrivateAdminRoute element={<UserManagement />} user={user} loading={loading} />} />
                  <Route path="/admin/blogs" element={<PrivateAdminRoute element={<BlogManagement />} user={user} loading={loading} />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
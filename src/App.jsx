import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import NewProductPage from './pages/NewProductPage.jsx';
import EditProductPage from './pages/EditProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import EsewaRedirectPage from './pages/EsewaRedirectPage.jsx';
import SplashPage from './pages/SplashPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <div className="app-shell">
              <Header />
              <div className="main-content">
                <Outlet />
              </div>
              <div className="figma-bottom-bar">
                <span>STYLE HER</span>
                <span>New arrivals</span>
                <span>Cart</span>
                <span>Profile</span>
              </div>
            </div>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/dress" element={<CategoryPage category="dress" title="Dresses" />} />
          <Route path="/top" element={<CategoryPage category="top" title="Tops" />} />
          <Route path="/bottom" element={<CategoryPage category="bottom" title="Bottoms" />} />
          <Route path="/ethnic-wear" element={<CategoryPage category="ethnic-wear" title="Ethnic Wear" />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/product/:id/edit" element={<EditProductPage />} />
          <Route path="/new" element={<NewProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/esewa" element={<EsewaRedirectPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

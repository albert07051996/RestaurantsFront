import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          RESTAURANT
        </Link>

        <button
          className={`header-burger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="მენიუ"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`header-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            მენიუ
          </Link>
          <Link
            to="/track"
            className={`header-link ${isActive('/track') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            თრექინგი
          </Link>
          <Link
            to="/reserve"
            className={`header-link ${isActive('/reserve') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            რეზერვაცია
          </Link>

          {isAuthenticated && (
            <>
              <div className="header-divider" />
              <Link
                to="/orders"
                className={`header-link ${isActive('/orders') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                შეკვეთები
              </Link>
              <Link
                to="/sessions"
                className={`header-link ${isActive('/sessions') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                სესიები
              </Link>
              <Link
                to="/tables"
                className={`header-link ${isActive('/tables') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                მაგიდები
              </Link>
              <Link
                to="/reservations"
                className={`header-link ${isActive('/reservations') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                რეზერვაციები
              </Link>
              <Link
                to="/menu"
                className={`header-link ${isActive('/menu') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                მენიუს მართვა
              </Link>
              <Link
                to="/add-dish"
                className={`header-link ${isActive('/add-dish') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                კერძის დამატება
              </Link>
              <Link
                to="/add-category"
                className={`header-link ${isActive('/add-category') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                კატეგორია
              </Link>
              <button className="header-logout" onClick={handleLogout}>
                გასვლა
              </button>
            </>
          )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className={`header-link ${isActive('/login') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              შესვლა
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

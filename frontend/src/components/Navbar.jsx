import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaDumbbell, FaBookOpen, FaUserCircle,
  FaCaretDown, FaSignOutAlt, FaCog,
  FaHistory, FaChartLine, FaTrophy
} from "react-icons/fa";
import { MdSubscriptions } from "react-icons/md";
import "./Navbar.css";

export default function Navbar({ content }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const dropdownItems = [
    { icon: <FaUserCircle />, text: "Profile", path: "/profile" },
    { icon: <FaHistory />, text: "History", path: "/workouts" },
    { icon: <FaChartLine />, text: "Progress", path: "/progress" },
    { icon: <FaTrophy />, text: "Achievements", path: "/achievements" },
    { icon: <FaCog />, text: "Settings", path: "/settings" }
  ];

  return (
    <>
      <header className="navbar-header">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <FaDumbbell /> <span>FitLife</span>
          </Link>

          <nav className="navbar-links">
            <NavLink to="/" icon={<FaHome />} text="Home" current={pathname} />
            <NavLink to="/education" icon={<FaBookOpen />} text="Education" current={pathname} />
            <NavLink to="/challenges" icon={<FaTrophy />} text="Challenges" current={pathname} />
            <NavLink to="/subscriptions" icon={<MdSubscriptions />} text="Subscription" current={pathname} />
          </nav>

          <div className="navbar-auth">
            {user ? (
              <div className="profile-dropdown">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" />
                  ) : (
                    <FaUserCircle />
                  )}
                  <FaCaretDown className={dropdownOpen ? 'open' : ''} />
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    {dropdownItems.map((item, i) => (
                      <Link
                        key={i}
                        to={item.path}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.icon} <span>{item.text}</span>
                      </Link>
                    ))}
                    <button onClick={handleLogout}>
                      <FaSignOutAlt /> <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <FaUserCircle /> <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="content-container">
        {content}
      </main>
    </>
  );
}

function NavLink({ to, icon, text, current }) {
  return (
    <Link to={to} className={`navbar-link ${current === to ? 'active' : ''}`}>
      {icon} <span>{text}</span>
    </Link>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaDumbbell, FaBookOpen, FaUserCircle,
  FaCaretDown, FaSignOutAlt, FaCog,
  FaHistory, FaChartLine, FaTrophy, FaUtensils, FaClipboardList
} from "react-icons/fa";
import { MdSubscriptions } from "react-icons/md";
import "./Navbar.css";

export default function Navbar({ content }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [plansDropdownOpen, setPlansDropdownOpen] = useState(false);
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

  const togglePlansDropdown = (e) => {
    e.stopPropagation();
    setPlansDropdownOpen(!plansDropdownOpen);
    if (profileDropdownOpen) setProfileDropdownOpen(false);
  };

  const dropdownItems = [
    { icon: <FaUserCircle />, text: "Profile", path: "/profile" },
    { icon: <FaHistory />, text: "History", path: "/workouts" },
    { icon: <FaChartLine />, text: "Progress", path: "/progress" },
    { icon: <FaTrophy />, text: "Achievements", path: "/achievements" },
    { icon: <FaCog />, text: "Settings", path: "/settings" }
  ];

  const plansItems = [
    { 
      icon: <FaClipboardList />, 
      text: "Fitness Plan", 
      path: "/fitnessplan",
      onClick: (e) => {
        e.preventDefault();
        navigate("/fitnessplan");
        setPlansDropdownOpen(false);
      }
    },
    { 
      icon: <FaUtensils />, 
      text: "Meals Plan", 
      path: "/mealsplan",
      onClick: (e) => {
        e.preventDefault();
        navigate("/mealsplan");
        setPlansDropdownOpen(false);
      }
    }
  ];
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setPlansDropdownOpen(false);
      setProfileDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <header className="navbar-header">
        <div className="navbar-container">
          <Link to="/home" className="navbar-brand">
            <FaDumbbell /> <span>FitLife</span>
          </Link>

          <nav className="navbar-links">
            <NavLink to="/home" icon={<FaHome />} text="Home" current={pathname} />
            
            {/* Plans Dropdown */}
            <div className="navbar-dropdown">
              <button 
                className={`navbar-link ${plansItems.some(item => pathname === item.path) ? 'active' : ''}`}
                onClick={togglePlansDropdown}
              >
                <FaClipboardList /> 
                <span>Plans</span> 
                <FaCaretDown className={`dropdown-caret ${plansDropdownOpen ? 'open' : ''}`} />
              </button>
              {plansDropdownOpen && (
  <div className="dropdown-menu plans-menu show">
    {plansItems.map((item, i) => (
      <a
        key={i}
        href={item.path}
        className={`dropdown-item ${pathname === item.path ? 'active' : ''}`}
        onClick={item.onClick}
      >
        {item.icon} <span>{item.text}</span>
      </a>
    ))}
  </div>
)}
            </div>
            
            <NavLink to="/education" icon={<FaBookOpen />} text="Education" current={pathname} />
            <NavLink to="/challenges" icon={<FaTrophy />} text="Challenges" current={pathname} />
            <NavLink to="/subscriptions" icon={<MdSubscriptions />} text="Subscription" current={pathname} />
          </nav>

          <div className="navbar-auth">
            {user ? (
              <div className="profile-dropdown">
                <button onClick={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setPlansDropdownOpen(false);
                }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="profile-avatar" />
                  ) : (
                    <FaUserCircle />
                  )}
                  <FaCaretDown className={`dropdown-caret ${profileDropdownOpen ? 'open' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="dropdown-menu profile-menu">
                    {dropdownItems.map((item, i) => (
                      <Link
                        key={i}
                        to={item.path}
                        onClick={() => setProfileDropdownOpen(false)}
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
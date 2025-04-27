import { useState, useEffect } from "react";
import AxiosInstance from "./Axiosinstance";
import { FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any existing auth data on component mount
  useEffect(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }, []);

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      form: ""
    };
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for the current field when typing
    if (errors[name] || errors.form) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
        form: ""
      }));
    }
  };

  // In the handleSubmit function within the Login component
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!validateForm()) {
      setLoading(false);
      return;
    }
  
    try {
      const response = await AxiosInstance.post("/login/", {
        email: formData.email.trim(),
        password: formData.password
      });
  
      console.log("Login response:", response); // Debug log
  
      if (response.status === 200 && response.data?.token) {
        const user = response.data.user || {};
        console.log("User data:", user); // Debug log
  
        // Store authentication data
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(user));
  
        // Check user roles (handle string or boolean values)
        const isAdmin = user.is_superuser === true || user.is_superuser === "true";
        const isInstructor = user.is_instructor === true || user.is_instructor === "true";
  
        console.log(`User roles - Admin: ${isAdmin}, Instructor: ${isInstructor}`); // Debug log
  
        // Redirect based on role hierarchy
        if (isAdmin) {
          console.log("Redirecting to admin dashboard"); // Debug log
          navigate("/admin", { replace: true });
        } else if (isInstructor) {
          console.log("Redirecting to instructor dashboard"); // Debug log
          navigate("/instructor", { replace: true });
        } else {
          console.log("Redirecting to home"); // Debug log
          navigate("/home", { replace: true });
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err); // Debug log
      
      let errorMessage = "Login failed. Please try again.";
      if (err.response) {
        console.log("Error response data:", err.response.data); // Debug log
        console.log("Error status:", err.response.status); // Debug log
        
        errorMessage = err.response.data?.error || err.message;
      }
  
      setErrors(prev => ({
        ...prev,
        form: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="lock-icon">
          <FaLock />
        </div>
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Log in to continue your fitness journey</p>

        {errors.form && (
          <div className="error-message" data-testid="error-message">
            {errors.form}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="fituser23@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              autoComplete="username"
              required
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              autoComplete="current-password"
              required
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
            <Link to="/reset" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                <span className="sr-only">Logging in...</span>
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="register-link">
          Don't have an account?{" "}
          <Link to="/register" className="register-link-text">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
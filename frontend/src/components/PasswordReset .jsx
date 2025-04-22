import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "./Axiosinstance";
import { FaLock, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Login.css";

const PasswordReset = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
    form: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState(null);

  // Extract token from URL query parameters
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const authToken = query.get('AuthToken');
    
    if (!authToken) {
      navigate('/reset'); // Redirect if no token
      return;
    }
    
    setToken(authToken);
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {
      newPassword: "",
      confirmPassword: "",
      form: ""
    };
    let isValid = true;

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name] || errors.form) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
        form: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await AxiosInstance.post(`/api/password_reset/confirm/`, {
        token: token, // Using the token from state
        password: formData.newPassword
      });

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 3000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      let errorMessage = "Password reset failed. Please try again.";
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.error || "Invalid or expired token";
            break;
          case 404:
            errorMessage = "Token not found";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Check your connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setErrors(prev => ({
        ...prev,
        form: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null; // Or a loading spinner while checking token
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="lock-icon">
          {success ? <FaCheck /> : <FaLock />}
        </div>
        <h2>{success ? "Password Reset Successfully" : "Reset Your Password"}</h2>
        <p className="login-subtitle">
          {success 
            ? "Redirecting to login page..."
            : "Enter your new password below"}
        </p>

        {errors.form && (
          <div className="error-message" data-testid="error-message">
            {errors.form}
          </div>
        )}

        {!success ? (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? "input-error" : ""}
                autoComplete="new-password"
                required
              />
              {errors.newPassword && (
                <span className="field-error">{errors.newPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
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
                  <span className="sr-only">Resetting password...</span>
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <p>Your password has been successfully updated.</p>
            <p>You will be redirected to the login page shortly.</p>
          </div>
        )}

        {!success && (
          <div className="register-link">
            Remember your password?{" "}
            <Link to="/" className="register-link-text">
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;
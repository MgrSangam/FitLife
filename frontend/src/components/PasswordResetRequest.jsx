import { useState } from "react";
import AxiosInstance from "./Axiosinstance";
import { FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const PasswordResetRequest = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    form: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {
      email: "",
      form: ""
    };
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    
    if (errors.email || errors.form) {
      setErrors(prev => ({
        ...prev,
        email: "",
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
      const response = await AxiosInstance.post("/api/password_reset/", {
        email: email.trim()
      });

      if (response.status === 200) {
        setSuccess(true);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      let errorMessage = "Password reset request failed. Please try again.";
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.error || "Invalid email address";
            break;
          case 404:
            errorMessage = "No account found with this email";
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

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="lock-icon">
          <FaLock />
        </div>
        <h2>Reset Your Password</h2>
        <p className="login-subtitle">
          {success 
            ? "Check your email for a password reset link"
            : "Enter your email to receive a password reset link"}
        </p>

        {errors.form && (
          <div className="error-message" data-testid="error-message">
            {errors.form}
          </div>
        )}

        {!success ? (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="fituser23@gmail.com"
                value={email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                autoComplete="email"
                required
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
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
                  <span className="sr-only">Sending request...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <p>We've sent instructions to reset your password to {email}.</p>
            <p>Didn't receive the email? Check your spam folder or <button 
              onClick={() => navigate('/reset')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366f1',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0
              }}
            >
              try again
            </button>.</p>
          </div>
        )}

        <div className="register-link">
          Remember your password?{" "}
          <Link to="/" className="register-link-text">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetRequest;
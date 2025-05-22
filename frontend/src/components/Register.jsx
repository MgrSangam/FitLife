import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AxiosInstance from "./Axiosinstance";
import { FaDumbbell } from "react-icons/fa";
import "../CSS/Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    age: "",
    height: "",
    weight: "",
    birthday: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await AxiosInstance.post("/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        birthday: formData.birthday
      });

      console.log("Registration successful:", response.data);
      navigate("/");
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ non_field_errors: "Registration failed. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">
          <FaDumbbell className="dumbbell-icon" /> FitLife
        </h1>
        <h2 className="create-account-title">Create New Account</h2>
        
        {errors.non_field_errors && (
          <div className="error-message">{errors.non_field_errors}</div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.first_name && <span className="error">{errors.first_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.last_name && <span className="error">{errors.last_name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.password2 && <span className="error">{errors.password2}</span>}
          </div>

          <div className="form-group">
            <button 
              type="submit" 
              className="register-button"
              disabled={isSubmitting}
            >
              <span className="button-text">
                {isSubmitting ? "Registering..." : "Register"}
              </span>
            </button>
          </div>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
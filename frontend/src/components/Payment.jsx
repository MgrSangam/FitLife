import React, { useState } from "react";
import { FaLock, FaCreditCard, FaUser } from "react-icons/fa";
import { BsCalendar2Month } from "react-icons/bs";
import { RiSecurePaymentLine } from "react-icons/ri";
import axiosInstance from "./Axiosinstance";
import "./Payment.css"; // You'll need to create this CSS file


const Payment = () => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: ""
  });
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardDetails(prev => ({
      ...prev,
      cardNumber: formattedValue
    }));
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardDetails(prev => ({
      ...prev,
      expiryDate: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.nameOnCard) {
        throw new Error("Please fill in all card details");
      }

      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        throw new Error("Please enter a valid 16-digit card number");
      }

      if (cardDetails.cvv.length !== 3) {
        throw new Error("Please enter a valid 3-digit CVV");
      }

      // Process payment
      const response = await axiosInstance.post("/payments/process/", {
        card_details: cardDetails,
        plan: "premium" // Assuming premium plan from previous page
      });

      if (response.status === 200) {
        setPaymentSuccess(true);
      } else {
        throw new Error("Payment processing failed");
      }
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="payment-success-container">
        <div className="payment-success-content">
          <div className="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p>Thank you for subscribing to our Premium Plan.</p>
          <p>Your subscription is now active.</p>
          <button 
            className="back-to-dashboard"
            onClick={() => window.location.href = "/dashboard"}
          >
            Go to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-content">
        <div className="payment-header">
          <h1>Complete Your Subscription</h1>
          <p>You're subscribing to: <strong>Premium Plan - Rs. 500/month</strong></p>
        </div>

        <div className="payment-card">
          <div className="secure-payment">
            <RiSecurePaymentLine className="secure-icon" />
            <span>Secure Payment</span>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <div className="input-with-icon">
                <FaCreditCard className="input-icon" />
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nameOnCard">Name on Card</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="nameOnCard"
                  name="nameOnCard"
                  value={cardDetails.nameOnCard}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <div className="input-with-icon">
                  <BsCalendar2Month className="input-icon" />
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="pay-now-button" disabled={loading}>
              {loading ? "Processing..." : "Pay Now - Rs. 500"}
            </button>

            <div className="payment-security-note">
              <FaLock className="lock-icon" />
              <span>Your payment is securely processed. We don't store your card details.</span>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
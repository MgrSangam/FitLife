import { useState, useEffect } from 'react';
import AxiosInstance from './Axiosinstance';
import {
  FaUser,
  FaCalendarAlt,
  FaWeight,
  FaRulerVertical,
  FaBullseye,
  FaRunning
} from 'react-icons/fa';

const UserForm = ({ setUser, setEditing }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    height: '',
    weight: '',
    birthday: '',
    goal_type: '',
    start_date: '',
    target_date: '',
    target_weight: '',
    activity_level: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch user profile and goal data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userResponse, goalResponse] = await Promise.all([
          AxiosInstance.get('/api/user/profile/'),
          AxiosInstance.get('/api/goals/')
        ]);

        const userData = userResponse.data || {};
        const goalData = goalResponse.data[0] || {};

        // Log response for debugging
        console.log('User Profile Response:', userData);
        console.log('Goal Response:', goalData);

        // Validate required fields
        const newFieldErrors = {};
        if (!userData.first_name) newFieldErrors.first_name = 'First name is missing';
        if (!userData.last_name) newFieldErrors.last_name = 'Last name is missing';
        if (!userData.weight && userData.weight !== 0) newFieldErrors.weight = 'Weight is missing';
        if (!userData.height && userData.height !== 0) newFieldErrors.height = 'Height is missing';

        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          age: userData.age || '',
          height: userData.height || '',
          weight: userData.weight || '',
          birthday: userData.birthday || '',
          goal_type: goalData.goal_type || '',
          start_date: goalData.start_date || '',
          target_date: goalData.target_date || '',
          target_weight: goalData.target_weight || '',
          activity_level: goalData.activity_level || ''
        });

        setFieldErrors(newFieldErrors);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to fetch data: ${err.response?.data?.detail || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field when user types
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.weight) newErrors.weight = 'Weight is required';
    if (!formData.height) newErrors.height = 'Height is required';
    if (!formData.goal_type) newErrors.goal_type = 'Goal type is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.target_date) newErrors.target_date = 'Target date is required';
    if (!formData.target_weight) newErrors.target_weight = 'Target weight is required';
    if (!formData.activity_level) newErrors.activity_level = 'Activity level is required';

    if (formData.start_date && formData.target_date) {
      const start = new Date(formData.start_date);
      const target = new Date(formData.target_date);
      if (target <= start) newErrors.target_date = 'Target date must be after start date';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare user profile data
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        birthday: formData.birthday || null
      };

      // Prepare goal data
      const goalData = {
        goal_type: formData.goal_type,
        start_date: formData.start_date,
        target_date: formData.target_date,
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        activity_level: formData.activity_level,
        age: formData.age ? parseInt(formData.age) : (formData.birthday ? calculateAge(formData.birthday) : null),
        height: formData.height ? parseFloat(formData.height) : null,
        current_weight: formData.weight ? parseFloat(formData.weight) : null
      };

      // Update user profile
      const userResponse = await AxiosInstance.patch('/api/user/profile/', userData);
      setUser(userResponse.data);

      // Update or create goal
      const existingGoal = (await AxiosInstance.get('/api/goals/')).data[0];
      if (existingGoal) {
        await AxiosInstance.patch(`/api/goals/${existingGoal.id}/`, goalData);
      } else {
        await AxiosInstance.post('/api/goals/', goalData);
      }

      setEditing(false);
    } catch (err) {
      console.error('Error updating profile or goals:', err);
      alert(`Failed to update: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: '',
      last_name: '',
      age: '',
      height: '',
      weight: '',
      birthday: '',
      goal_type: '',
      start_date: '',
      target_date: '',
      target_weight: '',
      activity_level: ''
    });
    setFieldErrors({});
    setEditing(false);
  };

  // Helper function to calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) return <div>Loading form data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h3>Personal Information</h3>
      <div className="form-row">
        <div className="form-group">
          <label><FaUser /> First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
            className={fieldErrors.first_name ? 'error' : ''}
          />
          {fieldErrors.first_name && <span className="error-message">{fieldErrors.first_name}</span>}
        </div>
        <div className="form-group">
          <label><FaUser /> Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
            className={fieldErrors.last_name ? 'error' : ''}
          />
          {fieldErrors.last_name && <span className="error-message">{fieldErrors.last_name}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label><FaCalendarAlt /> Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            min="0"
            className={fieldErrors.age ? 'error' : ''}
          />
          {fieldErrors.age && <span className="error-message">{fieldErrors.age}</span>}
        </div>
        <div className="form-group">
          <label><FaCalendarAlt /> Birth Date</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            className={fieldErrors.birthday ? 'error' : ''}
          />
          {fieldErrors.birthday && <span className="error-message">{fieldErrors.birthday}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label><FaWeight /> Current Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            step="0.1"
            required
            className={fieldErrors.weight ? 'error' : ''}
          />
          {fieldErrors.weight && <span className="error-message">{fieldErrors.weight}</span>}
        </div>
        <div className="form-group">
          <label><FaRulerVertical /> Height (cm)</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            step="0.1"
            required
            className={fieldErrors.height ? 'error' : ''}
          />
          {fieldErrors.height && <span className="error-message">{fieldErrors.height}</span>}
        </div>
      </div>

      <h3>Fitness Goals</h3>
      <div className="form-row">
        <div className="form-group">
          <label><FaBullseye /> Goal Type</label>
          <select
            name="goal_type"
            value={formData.goal_type}
            onChange={handleInputChange}
            required
            className={fieldErrors.goal_type ? 'error' : ''}
          >
            <option value="">Select Goal</option>
            <option value="lose">Lose Weight</option>
            <option value="gain">Gain Muscle</option>
            <option value="maintain">Maintain Weight</option>
          </select>
          {fieldErrors.goal_type && <span className="error-message">{fieldErrors.goal_type}</span>}
        </div>
        <div className="form-group">
          <label><FaWeight /> Target Weight (kg)</label>
          <input
            type="number"
            name="target_weight"
            value={formData.target_weight}
            onChange={handleInputChange}
            step="0.1"
            required
            className={fieldErrors.target_weight ? 'error' : ''}
          />
          {fieldErrors.target_weight && <span className="error-message">{fieldErrors.target_weight}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label><FaCalendarAlt /> Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            required
            className={fieldErrors.start_date ? 'error' : ''}
          />
          {fieldErrors.start_date && <span className="error-message">{fieldErrors.start_date}</span>}
        </div>
        <div className="form-group">
          <label><FaCalendarAlt /> Target Date</label>
          <input
            type="date"
            name="target_date"
            value={formData.target_date}
            onChange={handleInputChange}
            required
            className={fieldErrors.target_date ? 'error' : ''}
          />
          {fieldErrors.target_date && <span className="error-message">{fieldErrors.target_date}</span>}
        </div>
      </div>

      <div className="form-group">
        <label><FaRunning /> Activity Level</label>
        <select
          name="activity_level"
          value={formData.activity_level}
          onChange={handleInputChange}
          required
          className={fieldErrors.activity_level ? 'error' : ''}
        >
          <option value="">Select Activity Level</option>
          <option value="sedentary">Sedentary (little to no exercise)</option>
          <option value="light">Light (exercise 1-3 times/week)</option>
          <option value="moderate">Moderate (exercise 3-5 times/week)</option>
          <option value="active">Active (exercise 6-7 times/week)</option>
          <option value="very_active">Very Active (exercise 2x/day)</option>
        </select>
        {fieldErrors.activity_level && <span className="error-message">{fieldErrors.activity_level}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" className="cancel-btn" onClick={handleCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UserForm;
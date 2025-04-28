import React, { useState, useEffect } from "react";
import AxiosInstance from "./Axiosinstance"; // <-- adjust the import path
import "./UserList.css";

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AxiosInstance.get('api/users/');
        console.log(response.data); // Log the response to inspect its structure
        
        // Assuming the structure has is_superuser, is_staff, and role fields
        const filteredUsers = response.data.filter(user => 
          !user.is_superuser && 
          !user.is_staff && 
          user.role !== "instructor" // Adjust based on the actual model and fields
        );
        
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Join Date</th>
              <th>Age</th>
              <th>Height</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                <td>{user.age}</td>
                <td>{user.height}</td>
                <td>{user.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;

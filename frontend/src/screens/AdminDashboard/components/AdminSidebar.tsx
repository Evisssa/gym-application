
import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <ul>
        <li>
          <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-700">Home</Link>
        </li>
        <li>
          <Link to="/users" className="block py-2 px-4 rounded hover:bg-gray-700">Users</Link>
        </li>
        <li>
          <Link to="/classes" className="block py-2 px-4 rounded hover:bg-gray-700">Classes</Link>
        </li>
        
      </ul>
    </div>
  );
};

export default AdminSidebar;

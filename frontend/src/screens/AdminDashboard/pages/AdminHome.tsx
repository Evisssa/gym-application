import React from 'react';

const AdminHome: React.FC = () => {
  return (
    <div>
       <img
        src="/admin-user.png"
        alt="Admin user"
        className="mx-auto mb-4 w-32 h-32 rounded-full object-cover"
      />
      <h1 className="text-2xl font-bold">Welcome to the Admin Dashboard</h1>
      <p>This is the homepage of the admin dashboard.</p>
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Gym Rules</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Wear appropriate gym attire and footwear at all times.</li>
          <li>Wipe down equipment after use.</li>
          <li>Return weights and equipment to their proper place.</li>
          <li>No food or drinks (except water) allowed in workout areas.</li>
          <li>Respect other members and staff.</li>
          <li>Report any damaged equipment to staff immediately.</li>
        </ul>
      </section>
    </div>
  );
};

export default AdminHome;

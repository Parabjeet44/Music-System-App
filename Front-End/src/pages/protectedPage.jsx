// pages/protected-page.jsx
import React from 'react';

export async function getServerSideProps(context) {
  const { req } = context;
  
  // Check if user is authenticated
  if (!req.session || !req.session.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // User is authenticated, return props
  return {
    props: {
      user: req.session.user,
    },
  };
}

const ProtectedPage = ({ user }) => {
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>This is a protected page.</p>
    </div>
  );
};

export default ProtectedPage;

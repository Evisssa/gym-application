
import React, { useState } from 'react';
import {
  BrowserRouter as Router,
} from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import TopBar from './components/shared/TopBar';
import Footer from './components/shared/Footer';
import Modal from './components/shared/Modal';
import LoginForm from './components/forms/LoginForm';
import RegisterForm from './components/forms/RegisterForm';
import AppRoutes from './AppRoutes';

const App: React.FC = () => {
  const { loading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  const openModal = () => {
    setIsLoginView(true);
    setIsLoginModalOpen(true);
  };

  const closeModal = () => {
    setIsLoginModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <TopBar onLoginClick={openModal} />
        <main className="flex-grow pt-16"> {/* Add padding to avoid content being hidden by the fixed TopBar */}
          <AppRoutes />
        </main>
        <Footer />

        <Modal isOpen={isLoginModalOpen} onClose={closeModal}>
          {isLoginView ? (
            <LoginForm
              onSwitchToRegister={() => setIsLoginView(false)}
              onLoginSuccess={closeModal}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setIsLoginView(true)}
              onRegisterSuccess={closeModal}
            />
          )}
        </Modal>
      </div>
    </Router>
  );
};

export default App;

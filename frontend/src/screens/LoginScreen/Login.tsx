import React from 'react';


const LoginScreen: React.FC = () => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isLogin, setIsLogin] = useState(true);

  // const openModal = () => setIsModalOpen(true);
  // const closeModal = () => setIsModalOpen(false);
  // const switchToRegister = () => setIsLogin(false);
  // const switchToLogin = () => setIsLogin(true);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background to-surface pt-16">
      {/* <TopBar onLoginClick={openModal} /> */}
      <div className="text-center px-4">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">Welcome to the Gym App</h1>
        <p className="text-xl text-text mb-8">Your journey to a healthier you starts here.</p>
      </div>

      {/* <Modal isOpen={isModalOpen} onClose={closeModal}>
        {isLogin ? (
          <LoginForm onSwitchToRegister={switchToRegister} />
        ) : (
          <RegisterForm onSwitchToLogin={switchToLogin} />
        )}
      </Modal> */}
    </div>
  );
};

export default LoginScreen;

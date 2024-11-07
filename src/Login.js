import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Replace with your authentication API request
      const response = await axios.post('/api/login', values); 
      
      if (response.data.success) {
        message.success('Login bem-sucedido!');
        navigate('/home'); // Redirect to Home page on successful login
      } else {
        message.error('Credenciais inválidas.');
      }
    } catch (error) {
      message.error('Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Form
        name="login"
        onFinish={onFinish}
        style={{ width: '300px' }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Por favor, insira seu nome de usuário!' }]}
        >
          <Input placeholder="Nome de usuário" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
        >
          <Input.Password placeholder="Senha" />
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            style={{ width: '100%' }} 
            disabled={loading} // Disable input during loading
          >
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;

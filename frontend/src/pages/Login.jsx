import LoginForm from '../components/LoginForm/LoginForm';

export default function Login() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <LoginForm />
    </div>
  );
}
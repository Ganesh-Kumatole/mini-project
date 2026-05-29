import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signInWithGoogle } from '@/services/firebase/auth';
import { getLoginPageErrorMsg } from '../utils/helpers';
import { validateEmail, validateRequired } from '@/shared/utils/validators';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [globalError, setGlobalError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();

  const validators = {
    email: (val: string) => {
      if (!validateRequired(val)) {
        setEmailError('Email is required');
        return false;
      }
      if (!validateEmail(val)) {
        setEmailError('Enter a valid email address');
        return false;
      }
      setEmailError('');
      return true;
    },
    password: (val: string) => {
      if (!validateRequired(val)) {
        setPasswordError('Password is required');
        return false;
      }
      setPasswordError('');
      return true;
    },
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) validators.email(val);
  };
  
  const handleEmailBlur = () => validators.email(email);

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordError) validators.password(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ok = validators.email(email) && validators.password(password);
    if (!ok) return;

    setGlobalError('');
    setLoading(true);
    try {
      await loginUser(email, password);
      const returnUrl = sessionStorage.getItem('fintracker-return-url') || '/dashboard';
      sessionStorage.removeItem('fintracker-return-url');
      navigate(returnUrl);
    } catch (err: any) {
      setGlobalError(getLoginPageErrorMsg(err?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGlobalError('');
    setGoogleLoading(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      navigate(isNewUser ? '/signup' : '/dashboard');
    } catch (err: any) {
      setGlobalError(getLoginPageErrorMsg(err?.code ?? '') || err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    email,
    password,
    emailError,
    passwordError,
    globalError,
    loading,
    googleLoading,
    handleEmailChange,
    handleEmailBlur,
    handlePasswordChange,
    handleSubmit,
    handleGoogleSignIn,
  };
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, signInWithGoogle } from '@/services/firebase/auth';
import { getSignupPageErrorMsg, getPasswordStrength } from '../utils/helpers';
import { validateEmail, validateRequired } from '@/shared/utils/validators';

export const useSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const strength = getPasswordStrength(password);

  const validators: Record<string, () => boolean> = {
    name: () => {
      if (!validateRequired(name)) {
        setErrors((e) => ({ ...e, name: 'Full name is required' }));
        return false;
      }
      if (name.trim().length < 2) {
        setErrors((e) => ({ ...e, name: 'Name must be at least 2 characters' }));
        return false;
      }
      setErrors((e) => {
        const n = { ...e };
        delete n.name;
        return n;
      });
      return true;
    },
    email: () => {
      if (!validateRequired(email)) {
        setErrors((e) => ({ ...e, email: 'Email is required' }));
        return false;
      }
      if (!validateEmail(email)) {
        setErrors((e) => ({ ...e, email: 'Enter a valid email address' }));
        return false;
      }
      setErrors((e) => {
        const n = { ...e };
        delete n.email;
        return n;
      });
      return true;
    },
    password: () => {
      if (!validateRequired(password)) {
        setErrors((e) => ({ ...e, password: 'Password is required' }));
        return false;
      }
      if (password.length < 6) {
        setErrors((e) => ({ ...e, password: 'Password must be at least 6 characters' }));
        return false;
      }
      setErrors((e) => {
        const n = { ...e };
        delete n.password;
        return n;
      });
      return true;
    },
    confirmPassword: () => {
      if (!validateRequired(confirmPassword)) {
        setErrors((e) => ({ ...e, confirmPassword: 'Please confirm your password' }));
        return false;
      }
      if (confirmPassword !== password) {
        setErrors((e) => ({ ...e, confirmPassword: 'Passwords do not match' }));
        return false;
      }
      setErrors((e) => {
        const n = { ...e };
        delete n.confirmPassword;
        return n;
      });
      return true;
    },
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (errors.name) validators.name();
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errors.email) validators.email();
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errors.password) validators.password();
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (errors.confirmPassword) validators.confirmPassword();
  };

  const handleAgreeTermsChange = (checked: boolean) => {
    setAgreeTerms(checked);
    if (globalError) setGlobalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const areAllValidated = Object.values(validators).every((fn) => fn());
    if (!areAllValidated) return;

    if (!agreeTerms) {
      setGlobalError('Please agree to the Terms and Privacy Policy');
      return;
    }

    setGlobalError('');
    setLoading(true);

    try {
      await registerUser(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setGlobalError(getSignupPageErrorMsg(err?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGlobalError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setGlobalError(getSignupPageErrorMsg(err?.code ?? '') || err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    name,
    email,
    password,
    confirmPassword,
    agreeTerms,
    errors,
    globalError,
    loading,
    googleLoading,
    strength,
    validators,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleAgreeTermsChange,
    handleSubmit,
    handleGoogleSignUp,
  };
};

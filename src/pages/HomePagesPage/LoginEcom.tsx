import { useEffect, useState } from 'react';
import CustomTextField from '../../components/Fields/CustomTextField';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '../../components/feedback/SnackbarTechnician';
import SignInLoader from '../../components/feedback/SignInLoader';
import { useMutation } from '@tanstack/react-query';
import { loggedInUser } from '../../services/Ecommerce/userServices';
import { AlertColor } from '@mui/material/Alert';
import { userAuth } from '../../hooks/userAuth';

interface LoginForm {
  email: string;
  password: string;
}

interface FormError {
  email?: string;
  password?: string;
}

const LoginEcom = () => {
  const navigate = useNavigate();
  const { login, token, userInfo } = userAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');
  const [formError, setFormError] = useState<FormError>({});
  const [formData, setFormData] = useState<LoginForm>({ email: '', password: '' });

  const { mutateAsync: loginMutate, isPending } = useMutation({
    mutationFn: loggedInUser,
  });

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setFormError((previous) => ({ ...previous, [name]: undefined }));
  };

  const validateForm = (): FormError => {
    const errors: FormError = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format.';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required.';
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validateForm();
    setFormError(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const response = await loginMutate(formData);

      if (!response?.success) {
        throw new Error(response?.message || 'Login was not successful.');
      }

      login({
        token: response.token,
        userInfo: {
          id: response.userInfo.id,
          full_name: response.userInfo.full_name,
          email: response.userInfo.email,
          role: response.userInfo.role,
          positions_id: response.userInfo.positions_id,
          status: response.userInfo.status,
          permissions: response.userInfo.permissions ?? [],
          url_permission: response.userInfo.url_permission,
          url: '/beesee/ecommerce',
        },
      });
      window.location.href = '/beesee/ecommerce';
    } catch (error) {
      console.error('Ecommerce login error:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Invalid email or password, please try again.');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    if (token && userInfo?.url_permission === 'ecommerce') {
      window.location.href = '/beesee/ecommerce';
      return;
    }

    setIsChecking(false);
  }, [token, userInfo]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (isChecking) {
    return <div className="flex items-center justify-center h-screen text-gray-500" />;
  }

  return (
    <div className="flex justify-center items-center bg-white min-h-screen p-4">
      <SignInLoader loading={isPending} />
      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        type={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />

      <div className="w-full max-w-md flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col w-full"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6 sm:mb-8">
            <img src="/beeSeeGold.png" alt="BeeSee Logo" className="h-20 sm:h-24 w-auto" />
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-[var(--beesee-gold)] mb-3 sm:mb-6 text-center text-5xl sm:text-5xl"
          >
            Ecommerce Sign In
          </motion.h2>

          <motion.p
            className="text-center mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base"
            variants={itemVariants}
          >
            Sign in to manage your ecommerce panel
          </motion.p>

          <motion.form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
            <motion.div variants={itemVariants}>
              <CustomTextField
                name="email"
                placeholder="Email"
                value={formData.email}
                multiline={false}
                rows={1}
                type="email"
                onChange={handleChangeInput}
                maxLength={100}
                icon={<Mail className="w-4 h-4" />}
                error={!!formError.email}
                helperText={formError.email}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <CustomTextField
                name="password"
                placeholder="Password"
                value={formData.password}
                multiline={false}
                rows={1}
                type="password"
                onChange={handleChangeInput}
                maxLength={100}
                icon={<Lock className="w-4 h-4" />}
                error={!!formError.password}
                helperText={formError.password}
              />
            </motion.div>

            <motion.p
              variants={itemVariants}
              onClick={() => navigate('/forget-password')}
              className="text-blue-500 hover:underline cursor-pointer text-sm sm:text-base"
            >
              Forget Password
            </motion.p>

            <motion.button
              variants={itemVariants}
              className="beesee-button w-full py-3 text-sm sm:text-base"
              type="submit"
              disabled={isPending}
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginEcom;

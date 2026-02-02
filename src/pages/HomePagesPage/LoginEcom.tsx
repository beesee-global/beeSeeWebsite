import { useState, useEffect } from 'react';
import CustomTextField from '../../components/Fields/CustomTextField';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import Snackbar from '../../components/feedback/Snackbar';
import { useMutation } from '@tanstack/react-query';
import { loggedInUser } from '../../services/Ecommerce/userServices';
import { AlertColor } from '@mui/material/Alert';
import { userAuth } from '../../hooks/userAuth'

interface LoginForm {
  email: string;
  password: string;
}

interface FormError {
  email?: string;
  password?: string;
}

const Login = () => {
  const navigate = useNavigate(); 
  const { login, token, userInfo } = userAuth()

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success")
  const [checked, setChecked] = useState(false)

  const [formError, setFormError] = useState<FormError>({})

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // update form data
    setFormData({
      ...formData,
      [name]: value,
    });

    // remove the specific error for this field
    setFormError((prev) => ({
      ...prev,
      [name]: undefined
    }))
  };

  // login 
  const {
    mutateAsync: loggedMutate,
    isPending
  } = useMutation({
    mutationFn: loggedInUser
  })

  const handleSubmit = async(e: React.FormEvent) => {
    try {    
      e.preventDefault();
      const errors = validateForm();
      setFormError(errors)  
      if (Object.keys(errors).length > 0) return

      const response = await loggedMutate(formData); 
      if (response?.success) {
        const userInfo = {
          id: response.userInfo.id,
          full_name: response.userInfo.full_name,
          email: response.userInfo.email,
          role: response.userInfo.role,
          url_permission: response.userInfo.url_permission
        };

        // token is at response.data.token (root level of API response)
        login({ token: response.token, userInfo });  
      }
    } catch (err) {
      console.error("Login Error:", err);
      setSnackbarOpen(true)
      setSnackbarSeverity("error")
      setSnackbarMessage("Invalid email or password, please try again.")
    }  
  };

  const validateForm = (): FormError => {
    const errors: FormError = {}

    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format."

    if (!formData.password.trim()) errors.password = "Password is required."
    
    return errors;
  }
  
  // Variants for parent (staggering children)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // delay each child by 0.2s
      },
    },
  };

  // Variants for children
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }; 

  // Mark as checked when token/userInfo ready
  useEffect(() => {
    if (token !== undefined) {
      setChecked(true);
    }
  }, [token]);
  
  // ✅ Redirect immediately if token exists
  useEffect(() => {
    if (token) {
      if (userInfo?.url_permission === 'ecommerce')
      window.location.href = "/beesee/ecommerce"  
      setChecked(true);
      return;  
    }
  }, [token, navigate]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
      
      </div>
    );
  }


  return (
    <div className='flex justify-center items-center bg-white min-h-screen'>
      {/* Notification */}
      <Snackbar 
        open={snackbarOpen}
        message={snackbarMessage}
        type={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />

      <div className='grid grid-cols-1 md:grid-cols-2 w-full h-screen'>
        <div className='hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br
        from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden'>
          {/* Decorative background element */}
          <div className='absolute top-0 left-0 w-full h-full opacity-10'>
            <div className='absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full blur-3xl'></div>
            <div className='absolute bottom-20 right-10 w-96 h-96 bg-yellow-500 rounded-full blur-3xl'></div>
          </div>
          {/* logo */}
          <div className='relative z-10 mb-8'>
            <img 
              src="" 
              alt="" 
            />
          </div>

          {/* Main heading */}
          <div className='relative z-10 text-center max-w-md'>
            <h1 className='text-4xl font-bold text-white mb-4 leading-tight'>
              Welcome to Beesee Global Technologies Inc.
            </h1>
            <p className='text-gray-300 text-lg mb-8 leading-relaxed'>
              Join our community and unlock a world of possibilities. Your journey start here.
            </p>

            {/* Feature Highlight */}
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col justify-center p-8 w-full h-full"
        >
          <motion.h2
            variants={itemVariants}
            className="bee-title-lg text-[var(--beesee-gold)] text-center  mb-4 sm:mb-6"
          >
            Login Your Account
          </motion.h2>
          <motion.p 
            className="text-center mb-6 text-gray-600"
            variants={itemVariants}
          >
            Welcome back! Please enter your details
          </motion.p>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-7"
          >
            {/* Email */}
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

            {/* Password */}
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
              onClick={() => navigate("/forget-password")}
              className="text-blue-500 hover:underline cursor-pointer">
              Forget Password
            </motion.p>

            <motion.button
              variants={itemVariants}
              className="beesee-button"
              type="submit"
              disabled={isPending}
            >
              Sign in
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

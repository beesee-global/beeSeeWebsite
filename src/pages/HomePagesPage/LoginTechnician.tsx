import { useEffect, useState } from 'react';
import CustomTextField from '../../components/Fields/CustomTextField';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '../../components/feedback/Snackbar';
import { useMutation } from '@tanstack/react-query';
import { loggedInUser } from '../../services/Technician/userServices';
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

const LoginTechnician = () => { 
  const { login, token } = userAuth()
  const [isChecking, setIsChecking] = useState(false); 

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success")

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

  const {
    mutateAsync: loginMutate, 
    isPending
  } = useMutation({
    mutationFn: loggedInUser,
  })

  const handleSubmit = async(e: React.FormEvent) => {
    try {    
      e.preventDefault();
      const errors = validateForm();
      setFormError(errors);
      if (Object.keys(errors).length > 0) return;

      const response = await loginMutate(formData); 
      // response.data contains your API response
      if (response?.success) {  
        const userInfo = {
          id: response.userInfo.id,
          email: formData.email, // Use the email from the form
          full_name: response.userInfo.full_name,
          role: response.userInfo.role,
          permissions: response.userInfo.permissions
        };  
        // token is at response.data.token (root level of API response)
        login({ token: response.token, userInfo });  
      }
    } catch (err) {
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
      setSnackbarMessage("Invalid email or password, please try again.");
    }  
  };

  const validateForm = (): FormError => {
    const errors: FormError = {}

    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format."

    if (!formData.password.trim()) errors.password = "Password is required."
    
    return errors;
  }

  useEffect(() => {
    // if we don't have a token, go back to home
    if (token) {
      window.location.href = "/beesee/dashboard" 
      return;
    }  

    // Done checking
    setIsChecking(false);
  }, [token, login]);

    // 👇 Prevent rendering layout until checks are done
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        
      </div>
    );
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

  return (
    <div className='flex justify-center items-center bg-white min-h-screen'>
      {/* Notification */}
      <Snackbar 
        open={snackbarOpen}
        message={snackbarMessage}
        type={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />

      <div className='w-full h-screen flex items-center justify-center  p-8'> 
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col max-w-3xl"
        >
          <motion.h2
            variants={itemVariants}
            className="text-center text-3xl font-extrabold text-gray-800 mb-2"
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

           {/*  <motion.p 
              variants={itemVariants}
              onClick={() => navigate("/forget-password")}
              className="text-blue-500 hover:underline cursor-pointer">
              Forget Password
            </motion.p> */}

            <motion.button
              variants={itemVariants}
              className={`w-full text-white font-semibold py-3 px-4 rounded-md  ${
                isPending ? "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-900 cursor-not-allowed" 
                : "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800"
                }`}
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

export default LoginTechnician;

import CustomTextField from '../../components/Fields/CustomTextField';
import CustomDateField from '../../components/Fields/CustomDateField';
import Snackbar from '../../components/feedback/Snackbar';
import { AlertColor } from '@mui/material';
import { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock,
  Phone, 
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion'; 
import beeseeLogo from '../../../public/beeseelogo.png';  
import { registerUser } from '../../services/Ecommerce/userServices';
import { useMutation } from "@tanstack/react-query";

interface RegisterForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string; 
  address: string; 
  status?: string;
  role?: string;
}

interface FormError {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  phone?: string; 
  address?: string;
}

const Register = () => { 
  const [verifyEmail, setVerifyEmail] = useState<boolean>(false) 

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [formData, setFormData] = useState<RegisterForm>({
    first_name: '',
    last_name: '',  
    email: '',
    password: '',
    confirm_password: '', 
    phone: '', 
    address: '', 
    status: 'Active',
    role: 'Admin',
  });

  const [formError, setFormError] = useState<FormError>({});

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
    // update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // remove the specific error for this field when user types
    setFormError((prev) => ({
        ...prev,
        [name] : undefined,
    }))
  };

  const validateForm = (): FormError => {
    const errors: FormError = {};

    if (!formData.first_name.trim()) errors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required.';
    if (!formData.email.trim()) errors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format.';
    
    if (!formData.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!/^09\d{9}$/.test(formData.phone)) errors.phone = 'Phone number must start with 09 and be 11 digits long.';
    if (!formData.address.trim()) errors.address = 'Address is required.';

     // ✅ Enhanced password validation
    if (!formData.password.trim()) {
        errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Password must contain at least one number.';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        errors.password = 'Password must contain at least one special character.';
    }

    if (formData.confirm_password !== formData.password)
      errors.confirm_password = 'Passwords do not match.';
    
    return errors;
  };

  // mutation for registering user
  const { 
    mutateAsync: registerMutate, 
    isPending 
  } = useMutation({
    mutationFn: registerUser,
  });

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    setFormError(errors);

    if (Object.keys(errors).length > 0) {
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
      setSnackbarMessage("Please fill in all required fields.");
      return;
    }

    try { 
      await registerMutate(formData);

      // ✅ Success feedback
      setSnackbarOpen(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Successful registered!"); 
      clearForm();
    } catch (err: any) {
      // Default message
      let errorMessage = "Failed to register. Please try again.";

      // ✅ Check if it's an AxiosError with a 400 response
      if (err.response?.status === 400) {
        const message = err.response.data?.message;

        // Handle specific backend validation
        if (message === "Email already exists") {
          setFormError((prev) => ({
            ...prev,
            email: message, // Show inline email error
          }));
          errorMessage = message; // Show also in Snackbar (optional)
        } else {
          errorMessage = message || errorMessage;
        }
      }

      // ✅ Show snackbar feedback
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to register user.");
    } 
  };

  const clearForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
      address: '',
    });
    setFormError({});
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  /* VERIFY OTP */
  const handleChange = (value:string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // only allow digits
    const newOtp = [...otp]; 
    newOtp[index] = value;
    setOtp(newOtp)

    // move to the next input automatically
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1 ]?.focus()
    }
  }

  const handleVerify = () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) { 
      setSnackbarMessage("Please enter the full 6 degit")
      setSnackbarOpen(true)
      setSnackbarSeverity('error')
      return
    }
  }

  return (
    <div className="flex justify-center items-center bg-white min-h-screen">
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
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"></div>
            </div>

            {/* Logo */}
            <div className='relative z-10 mb-8'>
              <img 
                src={beeseeLogo} 
                alt="Beesee Logo" 
                className='w-32 h-32 object-contain drop-shadow-2xl'
              />
            </div>

            {/* Main heading */}
            <div className='relative z-10 text-center max-w-md'>
              <h1 className='text-4xl font-bold text-white mb-4 leading-tight'>
                Welcome to Beesee Global Technologies Inc.
              </h1>
              <p className='text-gray-300 text-lg mb-8 leading-relaxed'>
                Join our community and unlock a world of possibilities. Your journey starts here.
              </p>

              {/* Feature highlights */}
              <div className='space-y-4 text-left'>
                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-1'>
                    <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold mb-1'>Secure & Reliable</h3>
                    <p className='text-gray-400 text-sm'>Your data is protected with enterprise-grade security</p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-1'>
                    <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold mb-1'>Easy to Use</h3>
                    <p className='text-gray-400 text-sm'>Intuitive interface designed for everyone</p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-1'>
                    <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-white font-semibold mb-1'>24/7 Support</h3>
                    <p className='text-gray-400 text-sm'>Our team is always here to help you succeed</p>
                  </div>
                </div>
              </div>
            </div> 
          </div>

          {verifyEmail ? (
             <div className='w-full flex items-center justify-center flex-col p-8'>
              <h2 className='text-3xl font-bold text-center text-gray-800 mb-3'>Verify your email</h2>
              <p className='text-center text-gray-600 mb-6 text-sm md:text-[16px]'>
                Confirm your email address with the email we sent to:
                <br />
                <span className='font-semibold text-gray-800 text-sm md:text-[16px]'>{formData.email}</span>
                <span className='text-sm md:text-[16px] text-gray-500'>{" "}(sent via info@beese.ph, our official email authenticator)</span>
              </p>

              {/* OTP BOXES */}
              <div className='flex justify-center gap-5 mb-6'>
                {otp.map((value, index) => (
                  <input 
                    key={index}
                    type='text'
                    maxLength={1}
                    value={value}
                    ref={(el) => (inputsRef.current[index] = el)}
                    onChange={(e => handleChange(e.target.value, index))}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className='w-12 h-12 text-center text-xl font-semi-bold border border-gray-300 
                    rounded-md focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 outline-none 
                    transition'
                  />
                ))}
              </div>

              <p className='text-center text-gray-500 text-sm md:text-[16px] mb-4'>
                A one-time password (OTP) has been sent. Please enter within 5 minutes.
              </p>

              <button
                onClick={handleVerify} 
                className={`mt-2 w-full text-white font-semibold py-3 px-4 rounded-md transition max-w-lg ${ 
                  isPending ? "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 cursor-not-allowed" : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hover:via-gray-700 hover:to-gray-800"
                }`}
              >
                Verify
              </button>

              <div className='mt-6 text-sm md:text-[16px] w-full flex flex-col gap-2 pl-20 text-gray-600'>
                Didn't recieve the email? {" "}
                <br />
                
                <div className='flex gap-1 text-sm md:text-[16px]'>
                  <p>Check your spam or</p>
                  <button className='text-blue-500 hover:underline'>
                  resend OTP
                </button>
                </div>
              </div>
            </div>
          ) : ( 
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex flex-col justify-center p-8 w-full"
            >
              <motion.h2
                variants={itemVariants}
                className="text-center text-3xl font-extrabold text-gray-800 mb-2"
              >
                Create your account 
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-center mb-6 text-gray-600"
              >
                Welcome back! Please enter your details
              </motion.p>

              <motion.form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                variants={containerVariants}
              >
                <div className='grid grid-col-1 md:grid-cols-2 gap-4'>
                  {/* First Name */} 
                  <motion.div variants={itemVariants}>
                    <CustomTextField
                      name="first_name"
                      placeholder="First name"
                      value={formData.first_name}
                      multiline={false}
                      rows={1}
                      type="text"
                      onChange={handleChangeInput}
                      maxLength={100}
                      icon={<User className="w-4 h-4" />}
                      error={!!formError.first_name}
                      helperText={formError.first_name}
                    />  
                  </motion.div>

                  {/* Last Name */}
                  <motion.div variants={itemVariants}>
                    <CustomTextField
                      name="last_name"
                      placeholder="Last name"
                      value={formData.last_name}
                      multiline={false}
                      rows={1}
                      type="text"
                      onChange={handleChangeInput}
                      maxLength={100}
                      icon={<User className="w-4 h-4" />}
                      error={!!formError.last_name}
                      helperText={formError.last_name}
                    /> 
                  </motion.div>

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
                      placeholder="Enter password"
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

                  {/* Confirm Password */}
                  <motion.div variants={itemVariants}>
                    <CustomTextField
                      name="confirm_password"
                      placeholder="Enter confirm password"
                      value={formData.confirm_password}
                      multiline={false}
                      rows={1}
                      type="password"
                      onChange={handleChangeInput}
                      maxLength={100}
                      icon={<Lock className="w-4 h-4"/>}
                      error={!!formError.confirm_password}
                      helperText={formError.confirm_password}
                    /> 
                  </motion.div>

                  {/* Phone */}
                  <motion.div variants={itemVariants}> 
                    <CustomTextField
                      name="phone"
                      placeholder="09XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleChangeInput}
                      multiline={false}
                      maxLength={11}
                      type="tel"
                      rows={1}
                      icon={<Phone className="w-4 h-4" />}
                      error={!!formError.phone}
                      helperText={formError.phone}
                    />
                  </motion.div>
                </div>
                
                {/* Address */}
                <motion.div variants={itemVariants}>
                  <CustomTextField
                    name="address"
                    placeholder='Enter your complete address'
                    value={formData.address}
                    onChange={handleChangeInput}
                    multiline={true}
                    rows={3}
                    maxLength={200}
                    type='text'
                    icon={<MapPin className="w-4 h-4" />}
                    error={!!formError.address}
                    helperText={formError.address}
                  />
                </motion.div>

                {/* Date of Birth */}
                {/* <motion.div className="mt-3" variants={itemVariants}>
                  <CustomDateField
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChangeInput}
                  />
                  {formError.date_of_birth && (
                    <p className="text-red-500 text-sm mt-1">{formError.date_of_birth}</p>
                  )}
                </motion.div> */}

                {/* Signin Link */}
                {/* <motion.div variants={itemVariants}>
                  <p className="text-center mt-3">
                    Already have an account?{' '}
                    <span
                      onClick={() => navigate('/HomePage/sign-in')}
                      className="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      Sign in
                    </span>
                  </p>
                </motion.div>
              */}

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <button
                    className={`mt-2 w-full text-white font-semibold py-3 px-4 rounded-md transition ${
                      isPending ? "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800"
                    }`}
                    type="submit"
                    disabled={isPending}
                  >
                    Sign up
                  </button>
                </motion.div>
              </motion.form>
            </motion.div>
          ) }
        </div> 
    </div>
  );
};

export default Register;

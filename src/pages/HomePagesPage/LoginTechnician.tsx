import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loggedInUser } from '../../services/Technician/userServices';
import { AlertColor } from '@mui/material/Alert';
import { userAuth } from '../../hooks/userAuth';
import AdminLoginLayout from '../../components/auth/AdminLoginLayout';

const TECHNICIAN_DASHBOARD = '/beesee/dashboard';

interface LoginForm {
  email: string;
  password: string;
}

interface FormError {
  email?: string;
  password?: string;
}

const LoginTechnician = () => { 
  const navigate = useNavigate(); 
  const { login, token, userInfo, activateSession } = userAuth()
  const [isChecking, setIsChecking] = useState(false); 

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success")

  const [formError, setFormError] = useState<FormError>({})

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });

  useEffect(() => {
    activateSession('technician');
  }, [activateSession]);

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
      // Fastify wraps successful payloads in { data: ... }; Axios has already
      // returned the HTTP response body here.
      const result = response?.data ?? response;
      if (result?.success && result.token && result.userInfo) {
        const userInfo = {
          id: result.userInfo.id,
          email: formData.email, // Use the email from the form
          full_name: result.userInfo.full_name,
          role: result.userInfo.role,
          permissions: result.userInfo.permissions,
          url_permission: 'technician',
          // Technician administrators always land in the ticketing dashboard.
          // Do not depend on a database module URL, which can be stale or lack
          // the leading slash and fall through to the public catch-all route.
          url: TECHNICIAN_DASHBOARD
        };  
        login({ token: result.token, userInfo }, 'technician');
        navigate(TECHNICIAN_DASHBOARD, { replace: true });
      } else {
        throw new Error("The login response did not include session credentials.");
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
    if (token && userInfo) {
      const hasTechnicianAccess =
        userInfo.url_permission === 'technician_url' ||
        userInfo.url_permission === 'technician' ||
        userInfo.url?.startsWith(TECHNICIAN_DASHBOARD);

      if (hasTechnicianAccess) {
        navigate(TECHNICIAN_DASHBOARD, { replace: true });
      }
      return;
    }  

    // Done checking
    setIsChecking(false);
  }, [token, userInfo, navigate]);

    // 👇 Prevent rendering layout until checks are done
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        
      </div>
    );
  }
  
  return (
    <AdminLoginLayout
      title="Technician Login"
      formData={formData}
      formError={formError}
      isPending={isPending}
      snackbarOpen={snackbarOpen}
      snackbarMessage={snackbarMessage}
      snackbarSeverity={snackbarSeverity}
      onChange={handleChangeInput}
      onSubmit={handleSubmit}
      onCloseSnackbar={() => setSnackbarOpen(false)}
    />
  );
};

export default LoginTechnician;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loggedInUser } from '../../services/Ecommerce/userServices';
import { AlertColor } from '@mui/material/Alert';
import { userAuth } from '../../hooks/userAuth';
import AdminLoginLayout from '../../components/auth/AdminLoginLayout';

interface LoginForm {
  email: string;
  password: string;
}

interface FormError {
  email?: string;
  password?: string;
}

const ECOMMERCE_DESTINATION = '/beesee/ecommerce/dashboard';

const Login = () => {
  const navigate = useNavigate(); 
  const { login, token, userInfo, activateSession } = userAuth()

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success")
  const [checked, setChecked] = useState(false)

  const [formError, setFormError] = useState<FormError>({})

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });

  useEffect(() => {
    activateSession('ecommerce');
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
      const payload = response?.data ?? response;
      const apiUser = payload?.userInfo ?? payload?.user;
      const token = payload?.token;
      const didLoginSucceed = payload?.success === true || Boolean(token && apiUser);

      if (didLoginSucceed && token && apiUser) {
        // This is the dedicated E-commerce login, so do not use the API's
        // generic `url` value (it can point to the public home page).
        const destination = ECOMMERCE_DESTINATION;
        const userInfo = {
          id: apiUser.id,
          full_name: apiUser.full_name,
          email: apiUser.email,
          role: apiUser.role,
          positions_id: apiUser.positions_id,
          permissions: apiUser.permissions || [],
          url_permission: apiUser.url_permission || 'ecommerce',
          url: destination,
        };

        // Persist the access data before moving into the protected admin area.
        login({ token, userInfo }, 'ecommerce');
        navigate(destination, { replace: true });
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage('The login response was incomplete. Please try again.');
        setSnackbarOpen(true);
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setSnackbarOpen(true)
      setSnackbarSeverity("error")
      const status = err?.response?.status;
      setSnackbarMessage(
        status === 401 || status === 403
          ? "Invalid email or password, please try again."
          : status && status >= 500
            ? "The login service is unavailable. Please try again later or contact support."
            : "Unable to sign in right now. Please check your connection and try again."
      )
    }  
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 0,
      full_name: 'E-commerce Demo Admin',
      email: 'demo@beesee.local',
      role: 'Administrator',
      url_permission: 'ecommerce',
      url: ECOMMERCE_DESTINATION,
      permissions: [
        { parent_id: 'ecommerce', children_id: 'dashboard', module_name: 'Dashboard', module_url: '/beesee/ecommerce/dashboard', actions: ['view', 'create', 'update', 'delete'] },
        { parent_id: 'ecommerce', children_id: 'products', module_name: 'Products', module_url: '/beesee/ecommerce/product', actions: ['view', 'create', 'update', 'delete'] },
        { parent_id: 'ecommerce', children_id: 'categories', module_name: 'Categories', module_url: '/beesee/ecommerce/category', actions: ['view', 'create', 'update', 'delete'] },
      ],
    };

    login({ token: 'development-demo-ecommerce-token', userInfo: demoUser }, 'ecommerce');
    navigate(ECOMMERCE_DESTINATION, { replace: true });
  };

  const validateForm = (): FormError => {
    const errors: FormError = {}

    if (!formData.email.trim()) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format."

    if (!formData.password.trim()) errors.password = "Password is required."
    
    return errors;
  }
  
  // Mark as checked when token/userInfo ready
  useEffect(() => {
    if (token !== undefined) {
      setChecked(true);
    }
  }, [token]);
  
  // ✅ Redirect immediately if token exists
  useEffect(() => {
    if (token) {
      const hasEcommerceAccess =
        userInfo?.url_permission === 'ecommerce' ||
        userInfo?.url_permission === 'ecommerce_url' ||
        userInfo?.url?.startsWith('/beesee/ecommerce');

      if (hasEcommerceAccess) {
        navigate(userInfo?.url || ECOMMERCE_DESTINATION, { replace: true });
        setChecked(true);
      }
      return;
    }
  }, [token, userInfo, navigate]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
      
      </div>
    );
  }


  return (
    <AdminLoginLayout
      title="Ecommerce Login"
      formData={formData}
      formError={formError}
      isPending={isPending}
      snackbarOpen={snackbarOpen}
      snackbarMessage={snackbarMessage}
      snackbarSeverity={snackbarSeverity}
      onChange={handleChangeInput}
      onSubmit={handleSubmit}
      onCloseSnackbar={() => setSnackbarOpen(false)}
      // footer={(
      //   <button
      //     type="button"
      //     onClick={() => navigate("/website-configuration/sign-in")}
      //     className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-900 hover:underline"
      //   >
      //     Website Configuration administrator login
      //   </button>
      // )}
    />
  );
};

export default Login;

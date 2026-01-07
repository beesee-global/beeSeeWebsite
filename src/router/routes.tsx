import { lazy } from 'react'; 
import { Navigate, createBrowserRouter } from 'react-router-dom';  
import OurJourney from '../pages/EcommerceLayout/HomePageDesign/OurJourney/OurJourney';
import OurJourneyForm from '../pages/EcommerceLayout/HomePageDesign/OurJourney/OurJourneyForm';      
const NotFound = lazy(() => import('../pages/Error/404NotFound'));  

/* Homepage */
const HomePageLayout = lazy(() => import ("../../src/layout/HomePageLayout"))
const FrontPage = lazy (() => import("../pages/HomePagesPage/Home/HomePage"))
const AboutBeesee = lazy(() => import ("../../src/pages/HomePagesPage/About/AboutUs")) 
const FaqsHomePage = lazy(() => import ("../../src/pages/HomePagesPage/Faqs/Faqs"))
const PrivacyPolicy = lazy(() => import ('../pages/HomePagesPage/PrivacyPolicy/PrivacyPolicy'))
const TermsAndConditions = lazy(() => import ('../pages/HomePagesPage/TermAndConditions/TermsAndConditions'))
const CostumerSupport = lazy (() => import('../../src/pages/HomePagesPage/CustomerSupport/CustomerSupport')) 
const ProductDetail = lazy(() => import('../pages/HomePagesPage/ProductDetails/ProductDetail'));
const Loggedin = lazy(() => import('../pages/HomePagesPage/Login'));
const Register = lazy(() => import("../pages/HomePagesPage/Register"));
const ForgetPassword = lazy(() => import ("../pages/HomePagesPage/ForgetPasswordPages")); 
const ProductsHub = lazy(() => import("../pages/HomePagesPage/Products-hub/ProductsHub"));
const Solution = lazy(() => import("../pages/HomePagesPage/Solution/Solution"));

/* MainLayout */
const MainLayout = lazy(() => import ("../layout/EcommerceLayout"));
const MainDashboard = lazy(() => import ('../pages/EcommerceLayout/Dashboard/Dashboard'));
const MainProduct = lazy(() => import('../pages/EcommerceLayout/Product/Products'));
const MainProductForm = lazy (() => import ('../pages/EcommerceLayout/Product/ProductForm'));
const MainCategory = lazy(() => import('../pages/EcommerceLayout/Category/Category'));
const MainCategoryForm = lazy (() => import ('../pages/EcommerceLayout/Category/CategoryForm'));
const MainMyAccount = lazy(() => import("../pages/EcommerceLayout/MyAccount/MyAccount")) 
const Employee = lazy(() => import ('../pages/EcommerceLayout/Employee/Employee'));
const EmployeeForm = lazy(() => import ('../pages/EcommerceLayout/Employee/EmployeeForm'));
const MainSolutionsOverview = lazy(() => import("../pages/EcommerceLayout/HomePageDesign/SolutionsOverview/SolutionsOverview"));
const MainSolutionsOverviewForm = lazy(() => import("../pages/EcommerceLayout/HomePageDesign/SolutionsOverview/SolutionsOverviewForm"));
const MainSalesBanner = lazy(() => import("../pages/EcommerceLayout/HomePageDesign/BannerManager/BannerManager"));
const MainSalesBannerForm = lazy(() => import("../pages/EcommerceLayout/HomePageDesign/BannerManager/BannerManagerForm"));
 
const routes = [
    {
        path: '/', // Catch-all route
        element: <Navigate to="/homepage" />,
        layout: 'blank',
    },
    {
        path: '/',
        element: <HomePageLayout />,
        layout: 'blank',
        children: [
            {
                index:true,     
                element:<Navigate to="home" replace />,
            },
            {
                path: 'home',
                element: <FrontPage />
            },
            {
                path: 'products',
                element: <ProductsHub />
            },
            {
                path: 'about-beesee',
                element: <AboutBeesee />
            }, 
            {
                path: 'faqs', 
                element: <FaqsHomePage />
            },
            {
                path: 'privacy-policy',
                element: <PrivacyPolicy />
            },
            {
                path: 'terms-and-conditions',
                element: <TermsAndConditions />
            }, 
            {
                path: 'customer-support',
                element: <CostumerSupport /> ,   
            },
            {
                path: 'product/:id',
                element: <ProductDetail  />,
            },
            {
                path: "sign-in",
                element: <Loggedin />
            },
            {
                path: "sign-up/2046",
                element: <Register />
            }, 
            {
                path:  "forget-password",
                element: <ForgetPassword />
            }, 
        ]
    },

    /* Main Admin */
    {
        path: '/beesee',
        element: <MainLayout />,
        layout: 'blank',
        children: [
            {
                index:true,     
                element:<Navigate to="dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <MainDashboard />
            },
            {
                path: 'product',
                element: <MainProduct />
            },
            {
                path: 'product/form/:id?',
                element: <MainProductForm />
            },
            {
                path: 'category',
                element: <MainCategory />
            },
            {
                path: 'category/form/:id?',
                element: <MainCategoryForm />
            },
            {
                path: 'my-account',
                element: <MainMyAccount />
            },
            {
                path: 'employee',
                element: <Employee />
            },
            {
                path: 'employee/form/:id?',
                element: <EmployeeForm />
            },
            {
                path: 'our-journey',
                element: <OurJourney />
            },
            {
                path: 'our-journey/form/:id?',
                element: <OurJourneyForm />
            },
            {
                path: 'solutions-overview',
                element: <MainSolutionsOverview />
            },
            {
                path: 'solutions-overview/form/:id?',
                element: <MainSolutionsOverviewForm />
            },
            {
                path: 'manage-banner',
                element: <MainSalesBanner />
            },
            {
                path: 'manage-banner/form/:id?',
                element: <MainSalesBannerForm />
            },  
        ]
    }, 
    
    /* Not found routes */ 
    {
        path: '*', // Catch-all route
        element: <NotFound />,
        layout: 'blank', 
    },   
];

export { routes };

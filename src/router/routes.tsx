import { lazy } from 'react'; 
import { Navigate, createBrowserRouter } from 'react-router-dom';  
   
const NotFound = lazy(() => import('../pages/Error/404NotFound'));  

/* Homepage */
const HomePageLayout = lazy(() => import ("../../src/layout/HomePageLayout"))
const FrontPage = lazy (() => import("../pages/HomePagesPage/Home/HomePage"))
const AboutBeesee = lazy(() => import ("../../src/pages/HomePagesPage/About/AboutUs")) 
const FaqsHomePage = lazy(() => import ("../../src/pages/HomePagesPage/Faqs/Faqs"))
const InquiriesPage = lazy(() => import('../pages/HomePagesPage/Inquiries/Inquiries'));
const PrivacyPolicy = lazy(() => import ('../pages/HomePagesPage/PrivacyPolicy/PrivacyPolicy'))
const TermsAndConditions = lazy(() => import ('../pages/HomePagesPage/TermAndConditions/TermsAndConditions'))
const CostumerSupport = lazy (() => import('../../src/pages/HomePagesPage/CustomerSupport/CustomerSupport')) 
const ProductDetail = lazy(() => import('../pages/HomePagesPage/ProductDetails/ProductDetail'));
const Loggedin = lazy(() => import('../pages/HomePagesPage/LoginEcom'));
const LoginTechnician = lazy(() => import('../pages/HomePagesPage/LoginTechnician'));
const Register = lazy(() => import("../pages/HomePagesPage/Register"));
const ForgetPassword = lazy(() => import ("../pages/HomePagesPage/ForgetPasswordPages")); 
const ProductsHub = lazy(() => import("../pages/HomePagesPage/Products-hub/ProductsHub"));
const Careers = lazy(() => import("../pages/HomePagesPage/Careers/Careers"));
import TechnicianHome from '../pages/TechnicianPage/Home/Home';
const Solution = lazy(() => import("../pages/HomePagesPage/Solution/Solution")); 

/* Activity Details */
const ActivitiesDetails = lazy(() => import('../pages/HomePagesPage/Activities/components/ActivitiesDetails'));
const CareerDetails = lazy(() => import('../pages/HomePagesPage/Careers/components/JobPage'))
const UserForm = lazy(() => import('../pages/HomePagesPage/UserForm/UserForm'));

/* MainLayout */
const MainLayout = lazy(() => import ("../layout/EcommerceLayout"));
const MainDashboard = lazy(() => import ('../pages/EcommerceLayout/Dashboard/Dashboard'));
const MainProduct = lazy(() => import('../pages/EcommerceLayout/Product/Products'));
const MainProductForm = lazy (() => import ('../pages/EcommerceLayout/Product/ProductForm'));
const MainCategory = lazy(() => import('../pages/EcommerceLayout/Category/Category'));
const MainCategoryForm = lazy (() => import ('../pages/EcommerceLayout/Category/CategoryForm'));
const MainMyAccount = lazy(() => import("../pages/EcommerceLayout/MyAccount/MyAccount"));
const FeaturedProduct = lazy(() => import('../pages/EcommerceLayout/HomePageDesign/featured-products/FeaturedProducts'))
const FeaturedProductForm = lazy(() => import('../pages/EcommerceLayout/HomePageDesign/featured-products/FeaturedProductForm'))
// const Employee = lazy(() => import ('../pages/EcommerceLayout/Employee/Employee'));
// const EmployeeForm = lazy(() => import ('../pages/EcommerceLayout/Employee/EmployeeForm'));
// const MainSolutionsOverview = lazy(() => import("../pages/EcommerceLayout/HomePageDesign/SolutionsOverview/SolutionsOverview"));
// const MainSolutionsOverviewForm = lazy(() => import("../pages/EcommerceLayout/HomePageDesign/SolutionsOverview/SolutionsOverviewForm"));
// const MainSalesBanner = lazy(() => import("../pages/EcommerceLayout/HomePageDesign/BannerManager/BannerManager"));
// const MainSalesBannerForm = lazy(() => import("../pages/EcommerceLayout/HomePageDesign/BannerManager/BannerManagerForm"));
 
/* Technician */
const TechnicianLayout = lazy(() => import ("../layout/TechnicianLayout")); 
const TechnicianAccount = lazy(() => import('../pages/TechnicianPage/MyAccount/MyAccount')) 
const TechnicianCategory = lazy(() => import ('../pages/TechnicianPage/Category/Category'))
const TechnicianProduct = lazy(() => import('../pages/TechnicianPage/Product/Product'))
const TechnicianDashboard = lazy(() => import("../pages/TechnicianPage/Dashboard/Dashboard"))
const TechnicianUsers = lazy(() => import('../pages/TechnicianPage/Users/Users')); 
const TechnicianFaqs = lazy(() => import('../pages/TechnicianPage/Faqs/faqs'))
const TechnicianUsersForm = lazy(() => import('../pages/TechnicianPage/Users/UsersForm')) 
const TechnicianPosition = lazy(() => import('../pages/TechnicianPage/Position/Position'))
const TechnicianInquiries = lazy(() => import('../pages/TechnicianPage/Inquiries/Inquiries'))
const TechnicianTicketForm = lazy(() => import('../pages/TechnicianPage/Ticket/TicketForm'))
const TechnicianOrganization = lazy(() => import('../pages/TechnicianPage/Organization/Organization'))
const TechnicianIssueType = lazy(() => import ('../pages/TechnicianPage/Issue/Issue'))
const TechnicianInquiriesReply = lazy(() => import("../pages/TechnicianPage/Inquiries/InquriesReplyMessage"))
import TechnicianEmailConversationApp from '../pages/TechnicianPage/Home/EmailConversationApp';   
import Projects from '../pages/HomePagesPage/Projects/Projects'; 
import Activities from '../pages/HomePagesPage/Activities/Activities';
const TechnicianApplicant = lazy(() => import ('../pages/TechnicianPage/Applicants/Applicants'))
const TechnicianJobPosting = lazy(() => import("../pages/TechnicianPage/JobPosting/JobPosting"))
const TechnicianJobPostingForm = lazy(() => import("../pages/TechnicianPage/JobPosting/JobPostingForm"))
const TechnicianApplicantEmail = lazy(() => import('../pages/TechnicianPage/Applicants/ApplicantsEmail'))
const TechnicianAuditLogs = lazy(() => import('../pages/TechnicianPage/AuditLogs/AuditLogs'))

/* Conversation */
const ConversationLayout = lazy(() => import ("../layout/EmailConversationLayout"));
const ConversationDetails = lazy(() => import('../pages/EmailCoversationPublic/Home'))

// user

const routes = [
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
                path: 'solution',
                element: <Solution />
            },
            {
            path: 'inquiries/:id?',
            element: <InquiriesPage />
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
                path: 'bsg/career',
                element: <Careers />
            },
            {
                path: 'bsg/career/:id',
                element: <CareerDetails />
            },
            {
                path: 'projects',
                element: <Projects />
            },
            {
                path: 'activities',
                element: <Activities />   
            },
            {
                path: 'activity/:id',  // ACTIVITY DETAILS ROUTE - ADDED
                element: <ActivitiesDetails />,
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
                element: <LoginTechnician />
            },
            { 
                path: "ecom/sign-in",
                element: <Loggedin />
            },
            {
                path: "sign-up/2046",
                element: <Register />
            }, 
            {
                path:  "forget-password",
                element: <ForgetPassword />
            }
        ]
    },

    /* Main Admin */
    {
        path: '/beesee/ecommerce',
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
                path: 'feature-product',
                element: <FeaturedProduct/>
            },
            {
                path: 'feature-product/form/:id?',
                element: <FeaturedProductForm />
            }
            // {
            //     path: 'employee',
            //     element: <Employee />
            // },
            // {
            //     path: 'employee/form/:id?',
            //     element: <EmployeeForm />
            // },
            // {
            //     path: 'solutions-overview',
            //     element: <MainSolutionsOverview />
            // },
            // {
            //     path: 'solutions-overview/form/:id?',
            //     element: <MainSolutionsOverviewForm />
            // },
            // {
            //     path: 'manage-banner',
            //     element: <MainSalesBanner />
            // },
            // {
            //     path: 'manage-banner/form/:id?',
            //     element: <MainSalesBannerForm />
            // },  
        ]
    },

    /* technician */
    {
        path: '/beesee',
        element: <TechnicianLayout />,
        layout: 'blank',
        children: [
            {
                path: '/beesee',     
                element:<Navigate to="dashboard" />,
            },
            {
                path: 'dashboard',
                element: <TechnicianDashboard />
            },
            {
                path: 'job-order',
                element: <TechnicianHome />
            },
            {
                path: 'device',
                element: <TechnicianCategory />
            },
            {
                path: 'model',
                element: <TechnicianProduct />
            },
            {
                path: 'issue',
                element: <TechnicianIssueType />
            },
            {
                path: 'position',
                element: <TechnicianPosition />
            },
            {
                path: 'users',
                element: <TechnicianUsers />
            },
            {
                path: 'users/form/:id?',
                element: <TechnicianUsersForm />
            },
            {
                path: 'faqs',
                element: <TechnicianFaqs />
            },
            {
                path: 'job-order/conversation/:pid',
                element: <TechnicianEmailConversationApp />
            }, 
            {
                path: 'my-account',
                element: <TechnicianAccount />
            },
            {
                path: 'inquiries',
                element: <TechnicianInquiries />
            },
            {
                path: "inquiries/reply/:pid",
                element: <TechnicianInquiriesReply />
            }, 
            {
                path: 'job-order/submit-ticket',
                element: <TechnicianTicketForm />
            },
            {
                path: 'organization',
                element: <TechnicianOrganization />
            }, 
            {
                path:  "job-posting",
                element: <TechnicianJobPosting />
            }, 
            {
                path:  "job-posting/applicants/:id",
                element: <TechnicianApplicant />
            },
            {
                path:  "job-posting/form/:id?",
                element: <TechnicianJobPostingForm />
            },
            {
                path: 'job-posting/applicant/email/:id',
                element: <TechnicianApplicantEmail />
            },
            {
                path: 'audit-logs',
                element: <TechnicianAuditLogs />
            }
        ]
    },
    /* conversation */
    {
        path: '/c',
        element: <ConversationLayout />,
        layout: 'blank',
        children: [
            {
                path: '/c',     
                element:<Navigate to="conversation" />,
            },
            {
                path: 'conversation/:pid',
                element: <ConversationDetails />
            }, 
            {
                path: "bsg/user-form",
                element: <UserForm />
            }
        ]
    },
    /* Not found routes */ 
    {
        path: '*', // Catch-all route
        element: <Navigate to="/home" replace />, // CHANGED: Redirect to home instead of 404
        layout: 'blank', 
    },  
];

export { routes };

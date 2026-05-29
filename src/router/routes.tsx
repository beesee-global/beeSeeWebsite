import { Navigate } from 'react-router-dom';

import NotFound from '../pages/Error/404NotFound';

/* Homepage */
import HomePageLayout from '../../src/layout/HomePageLayout';
import FrontPage from '../pages/HomePagesPage/Home/HomePage';
import AboutBeesee from '../../src/pages/HomePagesPage/About/AboutUs';
import FaqsHomePage from '../../src/pages/HomePagesPage/Faqs/Faqs';
import InquiriesPage from '../pages/HomePagesPage/Inquiries/Inquiries';
import PrivacyPolicy from '../pages/HomePagesPage/PrivacyPolicy/PrivacyPolicy';
import TermsAndConditions from '../pages/HomePagesPage/TermAndConditions/TermsAndConditions';
import CostumerSupport from '../../src/pages/HomePagesPage/CustomerSupport/CustomerSupport';
import ProductDetail from '../pages/HomePagesPage/ProductDetails/ProductDetail';
import Loggedin from '../pages/HomePagesPage/LoginEcom';
import LoginTechnician from '../pages/HomePagesPage/LoginTechnician';
import Register from '../pages/HomePagesPage/Register';
import ForgetPassword from '../pages/HomePagesPage/ForgetPasswordPages';
import ProductsHub from '../pages/HomePagesPage/Products-hub/ProductsHub';
import Careers from '../pages/HomePagesPage/Careers/Careers';
import TechnicianHome from '../pages/TechnicianPage/Home/Home';
import Solution from '../pages/HomePagesPage/Solution/Solution';
import InterviewAction from '../pages/HomePagesPage/Careers/InterviewAction';

/* Activity Details */
import ActivitiesDetails from '../pages/HomePagesPage/Activities/components/ActivitiesDetails';
import CareerDetails from '../pages/HomePagesPage/Careers/components/JobPage';
import UserForm from '../pages/HomePagesPage/UserForm/UserForm';

/* MainLayout */
import MainLayout from '../layout/EcommerceLayout';
import MainDashboard from '../pages/EcommerceLayout/Dashboard/Dashboard';
import MainProduct from '../pages/EcommerceLayout/Product/Products';
import MainProductForm from '../pages/EcommerceLayout/Product/ProductForm';
import MainCategory from '../pages/EcommerceLayout/Category/Category';
import MainCategoryForm from '../pages/EcommerceLayout/Category/CategoryForm';
import MainMyAccount from '../pages/EcommerceLayout/MyAccount/MyAccount';
import FeaturedProduct from '../pages/EcommerceLayout/HomePageDesign/featured-products/FeaturedProducts';
import FeaturedProductForm from '../pages/EcommerceLayout/HomePageDesign/featured-products/FeaturedProductForm';

/* Technician */
import TechnicianLayout from '../layout/TechnicianLayout';
import TechnicianAccount from '../pages/TechnicianPage/MyAccount/MyAccount';
import TechnicianCategory from '../pages/TechnicianPage/Category/Category';
import TechnicianProduct from '../pages/TechnicianPage/Product/Product';
import TechnicianDashboard from '../pages/TechnicianPage/Dashboard/Dashboard';
import TechnicianUsers from '../pages/TechnicianPage/Users/Users';
import TechnicianFaqs from '../pages/TechnicianPage/Faqs/faqs';
import TechnicianUsersForm from '../pages/TechnicianPage/Users/UsersForm';
import TechnicianPosition from '../pages/TechnicianPage/Position/Position';
import TechnicianInquiries from '../pages/TechnicianPage/Inquiries/Inquiries';
import TechnicianTicketForm from '../pages/TechnicianPage/Ticket/TicketForm';
import TechnicianOrganization from '../pages/TechnicianPage/Organization/Organization';
import TechnicianIssueType from '../pages/TechnicianPage/Issue/Issue';
import TechnicianRejectedNote from '../pages/TechnicianPage/RejectedNote/RejectedNote';
import TechnicianInquiriesReply from '../pages/TechnicianPage/Inquiries/InquriesReplyMessage';
import TechnicianEmailConversationApp from '../pages/TechnicianPage/Home/EmailConversationApp';
import Projects from '../pages/HomePagesPage/Projects/Projects';
import Activities from '../pages/HomePagesPage/Activities/Activities';
import TechnicianApplicant from '../pages/TechnicianPage/Applicants/Applicants';
import TechnicianJobPosting from '../pages/TechnicianPage/JobPosting/JobPosting';
import TechnicianJobPostingForm from '../pages/TechnicianPage/JobPosting/JobPostingForm';
import TechnicianApplicantEmail from '../pages/TechnicianPage/Applicants/ApplicantsEmail';
import TechnicianAuditLogs from '../pages/TechnicianPage/AuditLogs/AuditLogs';
import TechnicianApplicantsInterviewList from '../pages/TechnicianPage/Applicants/Interview';

/* Conversation */
import ConversationLayout from '../layout/EmailConversationLayout';
import ConversationDetails from '../pages/EmailCoversationPublic/Home';
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
                path: 'support',
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
            },
            {
                path: "/applicants/action",
                element: <InterviewAction  />
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
                path: 'rejected-note',
                element: <TechnicianRejectedNote />
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
                path: "applicant/interview",
                element: <TechnicianApplicantsInterviewList />
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

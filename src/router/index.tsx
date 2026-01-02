import { createBrowserRouter } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import WebsiteLayout from '../components/Layouts/WebsiteLayout';
import { routes } from './routes';

const finalRoutes = routes.map((route) => {
    return {
        ...route,
        element:
            route.layout === 'blank' ? (
                <BlankLayout>{route.element}</BlankLayout>
            ) : route.layout === 'website' ? (
                <WebsiteLayout>{route.element}</WebsiteLayout>
            ) : (
                <DefaultLayout>{route.element}</DefaultLayout>
            ),
    };
});

const router = createBrowserRouter(finalRoutes);

export default router;

import { PropsWithChildren, Suspense } from 'react';
import App from '../../App';
import themeConfig from '../../theme.config'; 

const WebsiteLayout = ({ children }: PropsWithChildren) => {
    return (
        <App>
            <div className="">
                <Suspense> 
                </Suspense>
            </div>
        </App>
    );
};

export default WebsiteLayout;

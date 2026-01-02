import { PropsWithChildren, Suspense } from 'react';
import App from '../../App';

const BlankLayout = ({ children }: PropsWithChildren) => {
    return (
        <App>
            <Suspense>
                {' '}
                {/* <div
                    className="fixed top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: 'url(/assets/images/dsa8.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: '-1',
                        backgroundAttachment: 'fixed',
                    }}
                ></div> */}
                <div className="text-black dark:text-white-dark min-h-screen">{children} </div>
            </Suspense>
        </App>
    );
};

export default BlankLayout;

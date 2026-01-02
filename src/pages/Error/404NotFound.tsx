import { NavLink } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen " style={{ color: '#977219' }}>
            <div
                className="fixed top-0 left-0 w-full h-full"
                style={{
                    backgroundImage: 'url(/assets/images/dsa8.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: '-1',
                    backgroundAttachment: 'fixed',
                }}
            ></div>
            <div className="flex flex-col">
                <div className="text-5xl " style={{ color: '#FCD000' }}>
                    <strong>404 Not Found</strong>
                </div>
                <div className="my-3">
                    <strong>Oops! Page Not Found.</strong>{' '}
                </div>
                <p className="my-1">It looks like the page you're looking for doesn't exist. Here are a few reasons why this might have happened:</p>
                <ul className="ms-3 flex flex-col gap-2">
                    <li>- The URL may have been typed incorrectly.</li>
                    <li>- The page you're looking for might have been moved or deleted.</li>
                    <li>- There might be a broken link.</li>
                </ul>
                <div className=" mb-1 mt-3">
                    <strong>What Can You Do?.</strong>{' '}
                </div>
                <ul className="ms-3 flex flex-col gap-2">
                    <li>
                        - <strong>Double-check the URL:</strong> Make sure the web address is correct.
                    </li>
                    <li>
                        - <strong>Go back: </strong> Return to the previous page.
                    </li>
                    <li>
                        - <strong>Visit our homepage:</strong> Your Website Name to start fresh.
                    </li>
                    <li>
                        - <strong>Search:</strong> Use the search bar at the top to find what you're looking for.
                    </li>
                </ul>

                <div className="my-3">
                    If you believe this is an error, please contact our support team. <strong>SUPPRORT CENTER LINK: </strong>{' '}
                    <NavLink to={'http://localhost:5173/submit_ticket'}>http://localhost:5173/submit_ticket</NavLink>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

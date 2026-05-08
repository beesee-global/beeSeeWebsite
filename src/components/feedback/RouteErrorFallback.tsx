import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

const chunkLoadMessages = [
    'Failed to fetch dynamically imported module',
    'Importing a module script failed',
    'error loading dynamically imported module',
    'ChunkLoadError',
];

const getErrorMessage = (error: unknown) => {
    if (isRouteErrorResponse(error)) {
        return error.statusText || String(error.data || error.status);
    }

    if (error instanceof Error) {
        return error.message;
    }

    return String(error || 'Unknown application error');
};

const isChunkLoadError = (message: string) => {
    return chunkLoadMessages.some((chunkMessage) => message.includes(chunkMessage));
};

export default function RouteErrorFallback() {
    const error = useRouteError();
    const message = getErrorMessage(error);
    const shouldReloadForFreshAssets = isChunkLoadError(message);

    useEffect(() => {
        if (!shouldReloadForFreshAssets) return;

        const reloadKey = `beesee:route-chunk-reload:${window.location.pathname}`;
        const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
        if (Date.now() - lastReload < 10000) return;

        sessionStorage.setItem(reloadKey, String(Date.now()));
        window.location.reload();
    }, [shouldReloadForFreshAssets]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
            <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
                <h1 className="text-xl font-semibold text-slate-900">
                    {shouldReloadForFreshAssets ? 'Updating application files' : 'Something went wrong'}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                    {shouldReloadForFreshAssets
                        ? 'The page is loading fresh files from the latest deployment.'
                        : 'The page could not finish loading. Please refresh and try again.'}
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                    Refresh page
                </button>
            </section>
        </main>
    );
}

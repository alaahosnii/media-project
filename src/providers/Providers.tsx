import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '../components/ui/sidebar';
import { ToastContainer } from 'react-toastify';
import { UserProvider } from '../contexts/UserContext';
import { Provider } from 'react-redux';
import store from '../redux/store';

type ProvidersProps = {
    children: ReactNode;
}
const Providers = ({ children }: ProvidersProps) => {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <SidebarProvider>
                    <ToastContainer autoClose={false} draggable={false} />
                    <UserProvider>
                        {children}
                    </UserProvider>
                </SidebarProvider>
            </Provider>
        </QueryClientProvider>
    );
}

export default Providers;
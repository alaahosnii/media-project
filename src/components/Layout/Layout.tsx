import { Navigate, Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import useUser from "../../hooks/useUser";

const Layout = () => {
    const { user } = useUser();

    if (!user) {
        return <Navigate to="/login" />;
    } else {
        return (
            <div className="flex h-screen w-full">
                <AppSidebar user={user} />
                <div className="flex-1 p-4">
                    <Outlet />
                    {/* <SidebarTrigger /> */}
                </div>
            </div>
        );
    }
};

export default Layout;

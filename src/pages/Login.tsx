import LoginCard from "../components/LoginCard/LoginCard";
import { Navigate } from "react-router-dom";
import useUser from "../hooks/useUser";

const Login = () => {
    const { user } = useUser();
    if (user) {
        return <Navigate to="/" replace />;
    } else {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full">
                <LoginCard />
            </div>
        )
    }
}

export default Login;
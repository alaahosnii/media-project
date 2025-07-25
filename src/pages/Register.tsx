import RegisterCard from "../components/RegisterCard/RegisterCard";
import { Navigate } from "react-router-dom";
import useUser from "../hooks/useUser";

const Register = () => {
    const { user } = useUser();
    if (user) {
        return <Navigate to="/dashboard" replace />;
    } else {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full">
                <RegisterCard />
            </div>
        )
    }
}

export default Register; 
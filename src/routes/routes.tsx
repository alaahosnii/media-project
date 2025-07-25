import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Layout from "../components/Layout/Layout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import MovieDetails from "../pages/MovieDetails";
import AddMovie from "../pages/AddMovie";

const routes = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
        ],
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/media/:id",
        element: <MovieDetails />,
    },
    {
        path: "/add-media",
        element: <AddMovie />,
    },
]);

export default routes;

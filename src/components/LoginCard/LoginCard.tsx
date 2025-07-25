import { Form, Formik, type FormikErrors, type FormikProps } from 'formik';

import { Button } from "../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import type { LoginForm } from "../../types/Types";
import { useAppDispatch } from '../../hooks/reduxHooks/reduxHooks';
import { useAppSelector } from '../../hooks/reduxHooks/reduxHooks';
import { useNavigate } from 'react-router-dom';
import { toast, type Id } from 'react-toastify';
import { login } from '../../redux/features/login/AsyncThunks';
import { useEffect, useState } from 'react';

const LoginCard = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [toastId, setToastId] = useState<Id | null>(null);
    const { isLoading, errorMessage, user } = useAppSelector(state => state.login);
    const loginData: LoginForm = {
        email: '',
        password: ''
    }
    useEffect(() => {
        if (isLoading) {
            const id = toast.loading("Logging in...");
            setToastId(id);
        }
        if (user) {
            toast.update(toastId!, {
                render: "Logged in successfully",
                type: "success",
                isLoading: false,
                autoClose: 2000,
                draggable: false,
                onClose: () => {
                    window.location.reload();
                }
            });
        }
        if (errorMessage) {
            toast.update(toastId!, {
                render: errorMessage,
                type: "error",
                isLoading: false,
                autoClose: 2000,
                draggable: false,
            });
        }
    }, [isLoading, user, errorMessage]);
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Login to your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Formik
                    initialValues={loginData}
                    validateOnChange={false}
                    validateOnBlur={false}

                    validate={values => {
                        let errors: FormikErrors<LoginForm> = {};

                        if (!values.email) {
                            errors.email = 'Email is required';
                        } else if (
                            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                        ) {
                            errors.email = 'Invalid email address';
                        }
                        if (!values.password) {
                            errors.password = 'Password is required'
                        } else if (values.password.length < 8) {
                            errors.password = 'Password must be at least 8 characters long'
                        }

                        return errors;
                    }} onSubmit={(values: LoginForm, { resetForm }) => {
                        console.log(values);
                        dispatch(login(values));
                        resetForm();
                    }}
                >
                    {({
                        values,
                        handleChange,
                        handleBlur,
                        errors,
                        handleSubmit,
                    }: FormikProps<LoginForm>) => (
                        <Form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="Email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
                                </div>
                                {
                                    errors.email && (
                                        <p className="text-red-500">{errors.email}</p>
                                    )
                                }
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" placeholder="Password" value={values.password} onChange={handleChange} onBlur={handleBlur} />
                                </div>
                                {
                                    (errorMessage || errors.password) && (
                                        <p className="text-red-500">{errorMessage || errors.password}</p>
                                    )
                                }
                                <Button type="submit" disabled={isLoading}>Login</Button>

                            </div>
                        </Form>
                    )}
                </Formik>
            </CardContent>
            <CardFooter >
                <Button variant="outline" className='w-full' onClick={() => navigate("/register")}>Register</Button>
            </CardFooter>
        </Card>
    )
}

export default LoginCard;   
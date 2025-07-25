import { useAppDispatch } from "../../hooks/reduxHooks/reduxHooks";
import type { RegisterForm } from "../../types/Types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast, type Id } from "react-toastify";
import { useAppSelector } from "../../hooks/reduxHooks/reduxHooks";
import { Formik, type FormikErrors, type FormikProps } from "formik";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Form } from "formik";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { register } from "../../redux/features/register/AsyncThunks";

const RegisterCard = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [toastId, setToastId] = useState<Id | null>(null);
    const { isLoading, errorMessage, user } = useAppSelector(state => state.register); // TODO: update to registration state if available
    const registerData: RegisterForm = {
        name: '',
        email: '',
        password: ''
    }
    useEffect(() => {
        if (isLoading) {
            const id = toast.loading("Registering...");
            setToastId(id);
        }
        if (user) {
            toast.update(toastId!, {
                render: "Registered successfully",
                type: "success",
                isLoading: false,
                autoClose: 2000,
                draggable: false,
                onClose: () => {
                    navigate("/login");
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
    }, [isLoading, user, navigate, errorMessage]);
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Formik
                    initialValues={registerData}
                    validateOnChange={false}
                    validateOnBlur={false}
                    validate={values => {
                        let errors: FormikErrors<RegisterForm> = {};
                        if (!values.name) {
                            errors.name = 'Name is required';
                        }
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
                    }} onSubmit={(values: RegisterForm, { resetForm }) => {
                        dispatch(register(values));
                        resetForm();
                    }}
                >
                    {({
                        values,
                        handleChange,
                        handleBlur,
                        errors,
                        handleSubmit,
                    }: FormikProps<RegisterForm>) => (
                        <Form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Name" value={values.name} onChange={handleChange} onBlur={handleBlur} />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500">{errors.name}</p>
                                )}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="Email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500">{errors.email}</p>
                                )}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" placeholder="Password" type="password" value={values.password} onChange={handleChange} onBlur={handleBlur} />
                                </div>
                                {errors.password && (
                                    <p className="text-red-500">{errors.password}</p>
                                )}
                                <Button type="submit" disabled={isLoading}>Register</Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </CardContent>
            <CardFooter >
                <Button variant="outline" className='w-full' onClick={() => navigate("/login")}>Back to Login</Button>
            </CardFooter>
        </Card>
    )
}

export default RegisterCard;   
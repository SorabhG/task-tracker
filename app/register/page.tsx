"use client";
import { useState } from "react";
import { registerSchema } from "@/src/validation/authSchemas";
import { z } from "zod";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        setError("");


        const result = registerSchema.safeParse({
            email,
            password,
        });
        if (!result.success) {
            //const errors = result.error.flatten().fieldErrors;
            const errors = z.flattenError(result.error).fieldErrors;
            console.log("zod failed:", errors);
            setFieldErrors({
                email: errors.email?.[0],
                password: errors.password?.[0],
            });

            return;
        }
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.log("Registration failed:", data.error);
                setError(data.error);
                return;
            }

            console.log("Registration successful:", data);
        } catch (error) {
            console.log("Network or unexpected error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setFieldErrors((prev) => ({
                                ...prev,
                                email: undefined,
                            }));
                        }}
                        placeholder="Enter your email"
                    />
                </div>
                {fieldErrors.email && (
                    <p>{fieldErrors.email}</p>
                )}
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setFieldErrors((prev) => ({
                                ...prev,
                                password: undefined,
                            }));
                        }}
                        placeholder="Enter your password"
                    />
                </div>
                {fieldErrors.password && (
                    <p>{fieldErrors.password}</p>
                )}
                {error && <p>{error}</p>}
                <button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
}
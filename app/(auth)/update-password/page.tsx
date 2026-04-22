'use client';
import { supabase } from "@/supabase/authHelper";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";



const UpdatePassword = () => {

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) router.push("/sign-in");
        };
        checkUser();
    }, []);


    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setSuccess(false);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(true);
            setPassword("");
            setConfirmPassword("");
            setTimeout(() => router.push("/home"), 2000);
        }
        setLoading(false);
       
    };

    return (
        <div className="flex items-center justify-center ">
            <form onSubmit={handleUpdatePassword} className="w-full font-inc-sans max-w-md p-6 border rounded-lg">
                <h1 className="text-2xl font-inc-sans font-bold mb-6">Update Password</h1>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">Password updated successfully!</div>}
                
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 mb-4 border rounded"
                    required
                />
                
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 mb-6 border rounded"
                    required
                />
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-text hover:text-primary disabled:bg-gray-400"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
};

export default UpdatePassword;
import React, { useState } from 'react';
import styles from './register.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 8) {
            setError("Password should be at least 8 characters long");
            return;
        }

        // Here you would typically call an API to register the user
        console.log('Form submitted', { username, password });
        // If successful, redirect to login page
        router.push('/auth/login');
    }

    return (
        <div className={styles.div}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input 
                    type="email" 
                    placeholder="Enter your email..." 
                    value={username} 
                    className={styles.email} 
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    className={styles.password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword} 
                    className={styles.confirmpassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" className={styles.submit}>Sign Up</button>
                <p>Already have an account? <Link href="/auth/login">Log In</Link></p>
            </form>
        </div>
    );
}

export default Register;

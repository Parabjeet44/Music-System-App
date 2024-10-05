import React, { useState } from "react";
import styles from "./login.module.css";
import { signIn, signOut } from "next-auth/react"; // Import signOut
import { useRouter } from "next/router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Reset the error message

    try {
      const response = await fetch('http://localhost:5000/api/oauth/oauth-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('User saved:', data);

      if (data.success) {
        setIsLoggedIn(true); // Update login status
        router.push("/"); // Redirect to home page
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError("Error during login: " + error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    signIn("google", { callbackUrl: "/" }); // Redirect to home after Google sign-in
  };

  const handleSpotifySignIn = async () => {
    signIn("spotify", { callbackUrl: "/" }); // Redirect to home after Spotify sign-in
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' }); // Redirect to home after sign-out
    setIsLoggedIn(false); // Update login status
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Login</h2>
      {!isLoggedIn ? (
        <>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.srOnly}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email..."
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.srOnly}>
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password..."
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.submit}>
              Log in
            </button>
          </form>
          <br/>
          <div className={styles.socialLogin}>
            <button onClick={handleGoogleSignIn} className={styles.googleSignIn}>
              <i className="fab fa-google"></i>
              Log in with Google
            </button>
            <button onClick={handleSpotifySignIn} className={styles.spotifySignIn}>
              <i className="fab fa-spotify"></i>
              Log in with Spotify
            </button>
          </div>
        </>
      ) : (
        <button onClick={handleSignOut} className={styles.signOutButton}>
          Sign Out
        </button>
      )}
    </div>
  );
};

export default Login;

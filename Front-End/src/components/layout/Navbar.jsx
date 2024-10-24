import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import styles from './Navbar.module.css';
import Link from 'next/link';

const Navbar = () => {
  const router = useRouter();
  const { data: session } = useSession(); // Retrieve the session data

  return (
    <nav className={styles.nav}>
      <div>
        <button className={styles.backButton} onClick={() => router.back()}>
          <i className="fas fa-chevron-left nav-icons"></i>
        </button>
        <button className={styles.forwardButton} onClick={() => window.history.forward()}>
          <i className="fas fa-chevron-right nav-icons"></i>
        </button>
      </div>
      <div className={styles.navBar}>
        {session ? (
          <div className={styles.signUp}>
            <button onClick={() => signOut()}>Sign Out</button> {/* Button to sign out */}
          </div>
        ) : (
          <>
            <div className={styles.signUp}>
              <button><Link href='/auth/register'>Sign Up</Link></button>
            </div>
            <div className={styles.logIn}>
              <button><Link href='/auth/login'>Log In</Link></button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// components/SideBar.jsx

import React from 'react';
import styles from './sideBar.module.css'
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const SideBar = () => {
  const { data: session, status } = useSession();

  console.log("Session data:", session);
  console.log("Session status:", status);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.div}>
        <button>
          <i className='fas fa-home'></i>
          <span><Link href='/'>Home</Link></span>
        </button>
        <br />
        <button>
          <Link href='/search'>
            <i className='fas fa-search'></i>
            <span>Search</span>
          </Link>
        </button>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.menu}>
          <li>
            <button className={styles.menuItem}>
              <Link href='/Music/likedSong'>
                <i className='fas fa-heart'></i>
                <span>Liked Songs</span>
              </Link>
            </button>
          </li>
          <br />
          <li>
            <button className={styles.menuItem}>
              <Link href='/Music/playlist'>
                <i className='fas fa-list'></i>
                <span>Your Playlist</span>
              </Link>
            </button>
          </li>
        </ul>
      </nav>
      <div className={styles.auth}>
        {status === "loading" ? (
          <p>Loading...</p> // Optional: Loading indicator
        ) : !session ? (
          <>
            <button className={styles.authButton}>
              <Link href='/auth/register'>Sign Up</Link>
            </button>
            <br />
            <button className={styles.authButton}>
              <Link href='/auth/login'>Log In</Link>
            </button>
          </>
        ) : (
          <button className={styles.authButton} onClick={() => signOut({ callbackUrl: '/' })}>
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
};

export default SideBar;

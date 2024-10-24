import React from 'react';
import Footer from './Footer';
import Navbar from './Navbar';
import SideBar from './sideBar';
import styles from './layout.module.css'; // Create this CSS module

const Layout = ({ children }) => {
    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                <SideBar />
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    )
}

export default Layout;
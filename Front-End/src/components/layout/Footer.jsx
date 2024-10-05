import React from 'react'
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <hr className={styles.hr}></hr>
      <div className={styles.div}>
         <p className={styles.p}>@2024 All rights reserved to Melotune.</p>
      </div>
    </footer>
  )
}

export default Footer;

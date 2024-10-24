// pages/_app.jsx

import { SessionProvider } from 'next-auth/react';
import Layout from '../components/layout/Layout';
import Head from 'next/head'; // Import Head from next/head

const MyApp = ({ Component, pageProps }) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Your description here" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export default MyApp;

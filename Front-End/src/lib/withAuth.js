// lib/withAuth.js

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  const Wrapper = (props) => {
    const router = useRouter();
    const { data: session, status } = useSession({ required: true });

    useEffect(() => {
      if (status === 'loading') return; // Do nothing while loading
      if (!session) router.push('/auth/login'); // Redirect if not logged in
    }, [session, status]);

    if (status === 'loading' || !session) return null; // Render nothing while loading or if not authenticated

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;

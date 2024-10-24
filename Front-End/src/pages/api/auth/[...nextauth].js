import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import SpotifyProvider from 'next-auth/providers/spotify';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    SpotifyProvider({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback called with user:', user);
  
      const userData = {
        email: user.email,
        name: user.name,
        image: user.image,
      };
  
      try {
        const response = await fetch('http://localhost:5000/api/auth/oauth-signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Backend response:', data);
  
        if (data.success) {
          return true;
        } else {
          console.error('Sign-in failed:', data);
          return false;
        }
      } catch (error) {
        console.error('Error during sign in:', error);
        return false;
      }
    },
  
    async session({ session, token }) {
      // Add custom session properties if needed
      session.user.id = token.id;
      return session;
    },
  },
});

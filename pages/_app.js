import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect } from 'react';
import { collection, doc, setDoc, serverTimestamp } from '@firebase/firestore';

import '../styles/globals.css';
import { auth, db } from '../firebase';
import Login from './login';
import Loading from '../components/Loading';

function MyApp({ Component, pageProps }) {

  const [user, loading] = useAuthState(auth);

  useEffect(() => {

    const setUser = async() => {

      if (user){
  
        await setDoc(doc(collection(db, 'users'),user.uid),{
          email: user.email,
          lastSeen: serverTimestamp(),
          photoURL: user.photoURL
        },{ merge: true})
      }
    }
    setUser();
  }, [user]);

  if(loading) return <Loading />
  
  if(!user) return <Login />

  return <Component {...pageProps} />
}

export default MyApp;


import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { User, TripItinerary } from './types';

// Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", 
  authDomain: "exploremh-project.firebaseapp.com",
  projectId: "exploremh-project",
  storageBucket: "exploremh-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Standard robust initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const STORAGE_KEY_PREFIX = 'exploremh_data_';

export const authService = {
  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = authService.mapFirebaseUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  mapFirebaseUser: (firebaseUser: FirebaseUser): User => {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${firebaseUser.uid}`);
    const localData = data ? JSON.parse(data) : { favorites: [], savedTrips: [] };
    
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Explorer',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
      favorites: localData.favorites || [],
      savedTrips: localData.savedTrips || []
    };
  },

  getCurrentUser: (): User | null => {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? authService.mapFirebaseUser(firebaseUser) : null;
  },

  signUp: async (email: string, password: string): Promise<User> => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return authService.mapFirebaseUser(user);
  },

  login: async (email: string, password: string): Promise<User> => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return authService.mapFirebaseUser(user);
  },

  loginWithProvider: async (providerName: 'google' | 'github'): Promise<User> => {
    const provider = providerName === 'google' 
      ? new GoogleAuthProvider() 
      : new GithubAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    return authService.mapFirebaseUser(user);
  },

  logout: async () => {
    await signOut(auth);
  },

  saveTrip: (trip: TripItinerary): User | null => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const user = authService.mapFirebaseUser(firebaseUser);
    const newTrip = { ...trip, id: Date.now().toString(), createdAt: Date.now() };
    const updatedUser = {
      ...user,
      savedTrips: [newTrip, ...(user.savedTrips || [])]
    };

    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${firebaseUser.uid}`, 
      JSON.stringify({ favorites: updatedUser.favorites, savedTrips: updatedUser.savedTrips })
    );
    return updatedUser;
  },

  deleteTrip: (tripId: string): User | null => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const user = authService.mapFirebaseUser(firebaseUser);
    const updatedUser = {
      ...user,
      savedTrips: (user.savedTrips || []).filter(t => t.id !== tripId)
    };

    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${firebaseUser.uid}`, 
      JSON.stringify({ favorites: updatedUser.favorites, savedTrips: updatedUser.savedTrips })
    );
    return updatedUser;
  }
};


import { router, useSegments } from "expo-router";
import React from "react";
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';


const AuthContext = React.createContext<{
    user: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    isLoading: boolean
} | null>(null);

// This hook can be used to access the user info.
export function useAuth() {
    return React.useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | null, isLoading: boolean) {
    const segments = useSegments();

    React.useEffect(() => {
        if (isLoading) return; // Don't redirect while checking auth state
        
       
        const inAuthGroup = segments.length > 0 && segments[0] === "auth";
        const inTabsGroup = segments.length > 0 && segments[0] === "(tabs)";
        
        // Public tabs that don't require authentication
        const publicTabs = ["index", "collections"];
        const currentTab = segments.length > 1 ? segments[1] : null;
        const isPublicTab = inTabsGroup && currentTab && publicTabs.includes(currentTab);

        // Only redirect if user is not authenticated AND not in auth group AND not on a public tab
        if (!user && !inAuthGroup && !isPublicTab) {
            // For protected tabs (profile, upload), the pages themselves will handle showing auth modal
            // Don't auto-redirect to login
        } else if (user && inAuthGroup) {
            router.replace("/");
        }
    }, [user, segments, isLoading]);
}

export function AuthProvider(props: React.PropsWithChildren) {
    const [user, setUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        
            setUser(user);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        if (user) {
            user.getIdToken().then((token) => {
                console.log('ID Token:', token);
            });
        }
    }, [user]);

    useProtectedRoute(user, isLoading);

    return (
        <AuthContext.Provider
            value={{
                setUser,
                user,
                isLoading,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}

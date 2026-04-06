import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

type AuthMethod = "apple" | "guest" | null;

interface AuthState {
  isAuthenticated: boolean;
  authMethod: AuthMethod;
  userName: string | null;
}

const AUTH_STORAGE_KEY = "auth_state";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authQuery = useQuery({
    queryKey: ["authState"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as AuthState;
        }
        return { isAuthenticated: false, authMethod: null, userName: null } as AuthState;
      } catch (error) {
        return { isAuthenticated: false, authMethod: null, userName: null } as AuthState;
      }
    },
  });

  useEffect(() => {
    if (authQuery.data !== undefined) {
      setIsAuthenticated(authQuery.data.isAuthenticated);
      setAuthMethod(authQuery.data.authMethod);
      setUserName(authQuery.data.userName);
      setIsLoading(false);
    }
  }, [authQuery.data]);

  const signInMutation = useMutation({
    mutationFn: async ({ method, name }: { method: AuthMethod; name: string | null }) => {
      const state: AuthState = {
        isAuthenticated: true,
        authMethod: method,
        userName: name,
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
      return state;
    },
    onSuccess: (state) => {
      setIsAuthenticated(state.isAuthenticated);
      setAuthMethod(state.authMethod);
      setUserName(state.userName);
      queryClient.setQueryData(["authState"], state);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      setAuthMethod(null);
      setUserName(null);
      queryClient.setQueryData(["authState"], {
        isAuthenticated: false,
        authMethod: null,
        userName: null,
      });
    },
  });

  const signInWithApple = async (name: string | null) => {
    await signInMutation.mutateAsync({ method: "apple", name });
  };

  const signInAsGuest = async () => {
    await signInMutation.mutateAsync({ method: "guest", name: null });
  };

  const signOut = async () => {
    await signOutMutation.mutateAsync();
  };

  return {
    isAuthenticated,
    authMethod,
    userName,
    isLoading,
    signInWithApple,
    signInAsGuest,
    signOut,
  };
});

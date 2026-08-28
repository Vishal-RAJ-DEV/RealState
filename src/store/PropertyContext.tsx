'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Property, FilterState, User } from '@/types';

interface AppState {
  properties: Property[];
  savedProperties: string[];
  filters: FilterState;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
}

type Action =
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'RESET_FILTERS' }
  | { type: 'TOGGLE_SAVE'; payload: string }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' }
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'SET_PAGINATION'; payload: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  } }
  | { type: 'SET_LOADING'; payload: boolean };

const defaultFilters: FilterState = {
  city: '',
  listingType: 'Buy',
  propertyType: '',
  minPrice: 0,
  maxPrice: 20000000,
  beds: 0,
  searchQuery: '',
};

const initialState: AppState = {
  properties: [],
  savedProperties: [],
  filters: defaultFilters,
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  pagination: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: defaultFilters };
    case 'TOGGLE_SAVE':
      return {
        ...state,
        savedProperties: state.savedProperties.includes(action.payload)
          ? state.savedProperties.filter((id) => id !== action.payload)
          : [...state.savedProperties, action.payload],
      };
    case 'ADD_PROPERTY':
      return { ...state, properties: [action.payload, ...state.properties] };
    case 'SET_USER':
      return { ...state, currentUser: action.payload, isAuthenticated: !!action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false, savedProperties: [] };
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  setFilter: (filter: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleSave: (id: string) => void;
  addProperty: (property: Property) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  getSavedProperties: () => Property[];
  getUserListings: () => Property[];
  fetchProperties: (filters?: FilterState) => Promise<void>;
  fetchPropertyById: (id: string) => Promise<Property | null>;
  createProperty: (propertyData: any) => Promise<Property>;
  updateProperty: (id: string, data: any) => Promise<Property>;
  deleteProperty: (id: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user && !state.currentUser) {
      dispatch({
        type: 'SET_USER',
        payload: {
          id: session.user.id,
          name: session.user.name ?? '',
          email: session.user.email ?? '',
          phone: session.user.phone ?? '',
          avatar: session.user.image ?? '',
          memberSince: new Date().getFullYear().toString(),
        },
      });
      fetch('/api/saved-properties')
        .then(res => res.json())
        .then(data => {
          if (data.savedIds) {
            data.savedIds.forEach((id: string) => {
              if (!initialState.savedProperties.includes(id)) {
                dispatch({ type: 'TOGGLE_SAVE', payload: id });
              }
            });
          }
        })
        .catch(console.error);
    }
    if (!session && state.currentUser) {
      dispatch({ type: 'LOGOUT' });
    }
  }, [session, state.currentUser]);

  const setFilter = useCallback((filter: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const toggleSave = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_SAVE', payload: id });
    if (state.currentUser) {
      fetch('/api/saved-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: id }),
      }).catch(console.error);
    }
  }, [state.currentUser]);

  const addProperty = useCallback((property: Property) => {
    dispatch({ type: 'ADD_PROPERTY', payload: property });
  }, []);

  const setUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const fetchProperties = useCallback(async (filters?: FilterState) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = new URLSearchParams();
      const f = filters || state.filters;
      if (f.city) params.set("city", f.city);
      if (f.propertyType) params.set("type", f.propertyType);
      if (f.listingType) {
        if (f.listingType === 'Buy') params.set("listingFor", 'SALE');
        else if (f.listingType === 'Rent') params.set("listingFor", 'RENT');
        else if (f.listingType === 'PG') params.set("listingFor", 'RENT');
      }
      if (f.minPrice > 0) params.set("minPrice", String(f.minPrice));
      if (f.maxPrice < 20000000) params.set("maxPrice", String(f.maxPrice));
      if (f.beds > 0) params.set("bhk", String(f.beds));
      if (f.searchQuery) params.set("search", f.searchQuery);

      // If PG filter is selected, set type
      if (f.listingType === 'PG') {
        params.set("type", "PG_ROOM");
      }

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();

      dispatch({ type: 'SET_PROPERTIES', payload: data.properties });
      dispatch({ type: 'SET_PAGINATION', payload: data.pagination });
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters]);

  const fetchPropertyById = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching property:", error);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createProperty = useCallback(async (propertyData: any) => {
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create property");
      }
      const data = await res.json();
      dispatch({ type: 'ADD_PROPERTY', payload: data });
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateProperty = useCallback(async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update property");
      const updated = await res.json();
      dispatch({ type: 'SET_PROPERTIES', payload:
        state.properties.map(p => p.id === id ? updated : p)
      });
      return updated;
    } catch (error) {
      throw error;
    }
  }, [state.properties]);

  const deleteProperty = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete property");
      dispatch({ type: 'SET_PROPERTIES', payload:
        state.properties.filter(p => p.id !== id)
      });
      return true;
    } catch (error) {
      throw error;
    }
  }, [state.properties]);

  const getSavedProperties = useCallback(() => {
    return state.properties.filter((p) => state.savedProperties.includes(p.id));
  }, [state.properties, state.savedProperties]);

  const getUserListings = useCallback(() => {
    if (!state.currentUser) return [];
    return state.properties.filter((p) => p.owner.name === state.currentUser?.name);
  }, [state.properties, state.currentUser]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const value: AppContextValue = {
    state,
    dispatch,
    setFilter,
    resetFilters,
    toggleSave,
    addProperty,
    setUser,
    logout,
    getSavedProperties,
    getUserListings,
    fetchProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

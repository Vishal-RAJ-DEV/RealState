'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Property, FilterState, User } from '@/types';
import { properties } from '@/data/properties';

interface AppState {
  properties: Property[];
  savedProperties: string[];
  filters: FilterState;
  currentUser: User | null;
  isAuthenticated: boolean;
}

type Action =
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'RESET_FILTERS' }
  | { type: 'TOGGLE_SAVE'; payload: string }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' };

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
  properties,
  savedProperties: [],
  filters: defaultFilters,
  currentUser: null,
  isAuthenticated: false,
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
  getFilteredProperties: () => Property[];
  getSavedProperties: () => Property[];
  getUserListings: () => Property[];
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
  }, []);

  const addProperty = useCallback((property: Property) => {
    dispatch({ type: 'ADD_PROPERTY', payload: property });
  }, []);

  const setUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const getFilteredProperties = useCallback(() => {
    const { city, listingType, propertyType, minPrice, maxPrice, beds, searchQuery } = state.filters;
    return state.properties.filter((p) => {
      if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
      if (listingType === 'Buy' && p.listingType !== 'Sale') return false;
      if (listingType === 'Rent' && p.listingType !== 'Rent') return false;
      if (propertyType && p.type !== propertyType) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      if (beds > 0 && p.beds < beds) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [state.properties, state.filters]);

  const getSavedProperties = useCallback(() => {
    return state.properties.filter((p) => state.savedProperties.includes(p.id));
  }, [state.properties, state.savedProperties]);

  const getUserListings = useCallback(() => {
    if (!state.currentUser) return [];
    return state.properties.filter((p) => p.owner.name === state.currentUser?.name);
  }, [state.properties, state.currentUser]);

  const value: AppContextValue = {
    state,
    dispatch,
    setFilter,
    resetFilters,
    toggleSave,
    addProperty,
    setUser,
    logout,
    getFilteredProperties,
    getSavedProperties,
    getUserListings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

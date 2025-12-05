import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface KidsModeContextType {
  isKidsMode: boolean;
  toggleKidsMode: () => void;
  setKidsMode: (value: boolean) => void;
}

const KidsModeContext = createContext<KidsModeContextType | undefined>(undefined);

export const KidsModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKidsMode, setIsKidsModeState] = useState(false);

  // Load Kids Mode preference from storage on app start
  useEffect(() => {
    loadKidsModePreference();
  }, []);

  const loadKidsModePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('isKidsMode');
      if (savedMode !== null) {
        setIsKidsModeState(JSON.parse(savedMode));
      }
    } catch (error) {
      console.error('Failed to load Kids Mode preference:', error);
    }
  };

  const saveKidsModePreference = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('isKidsMode', JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save Kids Mode preference:', error);
    }
  };

  const setKidsMode = (value: boolean) => {
    setIsKidsModeState(value);
    saveKidsModePreference(value);
  };

  const toggleKidsMode = () => {
    const newValue = !isKidsMode;
    setIsKidsModeState(newValue);
    saveKidsModePreference(newValue);
  };

  return (
    <KidsModeContext.Provider value={{ isKidsMode, toggleKidsMode, setKidsMode }}>
      {children}
    </KidsModeContext.Provider>
  );
};

export const useKidsMode = () => {
  const context = useContext(KidsModeContext);
  if (context === undefined) {
    throw new Error('useKidsMode must be used within a KidsModeProvider');
  }
  return context;
};

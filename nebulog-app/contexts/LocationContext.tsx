import React, { createContext, useContext, useState } from "react";
import { PlaceDetails } from "@/lib/types";

interface LocationContextType {
  selectedLocation: PlaceDetails | null;
  setSelectedLocation: (location: PlaceDetails | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<PlaceDetails | null>(null);

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

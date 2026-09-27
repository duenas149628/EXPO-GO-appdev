import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const EggContext = createContext(null);

const STORAGE_KEY = '@eggtrack_data';

export default function EggProvider({ children }) {
  const [inventory, setInventory] = useState({
    pullet: 20,
    small: 35,
    medium: 80,
    large: 70,
    xlarge: 30,
    jumbo: 10,
  });

  const [sales, setSales] = useState([]);

  const [productions, setProductions] = useState([]);

  const [thresholds, setThresholds] = useState({
    pullet: 10,
    small: 15,
    medium: 20,
    large: 20,
    xlarge: 10,
    jumbo: 10,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load saved data when the app starts
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedData) {
          const data = JSON.parse(savedData);

          if (data.inventory) {
            setInventory(data.inventory);
          }

          if (data.sales) {
            setSales(data.sales);
          }

          if (data.productions) {
            setProductions(data.productions);
          }

          if (data.thresholds) {
            setThresholds(data.thresholds);
          }
        }
      } catch (error) {
        console.log('Error loading EggTrack data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data whenever the main data changes
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const saveData = async () => {
      try {
        const data = {
          inventory,
          sales,
          productions,
          thresholds,
        };

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(data)
        );
      } catch (error) {
        console.log('Error saving EggTrack data:', error);
      }
    };

    saveData();
  }, [
    inventory,
    sales,
    productions,
    thresholds,
    isLoading,
  ]);

  const addProduction = (production) => {
    const today = new Date()
      .toISOString()
      .split('T')[0];

    // Increase inventory every time production is recorded
    setInventory(previousInventory => ({
      pullet: previousInventory.pullet + production.pullet,
      small: previousInventory.small + production.small,
      medium: previousInventory.medium + production.medium,
      large: previousInventory.large + production.large,
      xlarge: previousInventory.xlarge + production.xlarge,
      jumbo: previousInventory.jumbo + production.jumbo,
    }));

    setProductions(previousProductions => {
      // Check if today's production record already exists
      const existingProductionIndex =
        previousProductions.findIndex(
          productionRecord =>
            productionRecord.date === today
        );

      // If today's record already exists,
      // add the new eggs to that daily record.
      if (existingProductionIndex !== -1) {
        const updatedProductions = [
          ...previousProductions,
        ];

        const existingRecord =
          updatedProductions[existingProductionIndex];

        updatedProductions[existingProductionIndex] = {
          ...existingRecord,

          pullet:
            existingRecord.pullet + production.pullet,

          small:
            existingRecord.small + production.small,

          medium:
            existingRecord.medium + production.medium,

          large:
            existingRecord.large + production.large,

          xlarge:
            existingRecord.xlarge + production.xlarge,

          jumbo:
            existingRecord.jumbo + production.jumbo,

          totalEggs:
            existingRecord.totalEggs +
            production.pullet +
            production.small +
            production.medium +
            production.large +
            production.xlarge +
            production.jumbo,
        };

        return updatedProductions;
      }

      // If there is no production record for today,
      // create a new daily record.
      const productionRecord = {
        id: Date.now(),
        date: today,

        pullet: production.pullet,
        small: production.small,
        medium: production.medium,
        large: production.large,
        xlarge: production.xlarge,
        jumbo: production.jumbo,

        totalEggs:
          production.pullet +
          production.small +
          production.medium +
          production.large +
          production.xlarge +
          production.jumbo,
      };

      return [
        productionRecord,
        ...previousProductions,
      ];
    });
  };

  const sellEggs = (sale) => {
    if (
      sale.pullet > inventory.pullet ||
      sale.small > inventory.small ||
      sale.medium > inventory.medium ||
      sale.large > inventory.large ||
      sale.xlarge > inventory.xlarge ||
      sale.jumbo > inventory.jumbo
    ) {
      return false;
    }

    setInventory(previousInventory => ({
      pullet: previousInventory.pullet - sale.pullet,
      small: previousInventory.small - sale.small,
      medium: previousInventory.medium - sale.medium,
      large: previousInventory.large - sale.large,
      xlarge: previousInventory.xlarge - sale.xlarge,
      jumbo: previousInventory.jumbo - sale.jumbo,
    }));

    return true;
  };

  const addSale = (sale) => {
    setSales(previousSales => [
      sale,
      ...previousSales,
    ]);
  };

  const updateThreshold = (size, value) => {
    setThresholds(previousThresholds => ({
      ...previousThresholds,
      [size]: value,
    }));
  };

  return (
    <EggContext.Provider
      value={{
        inventory,
        sales,
        productions,
        thresholds,
        addProduction,
        sellEggs,
        addSale,
        updateThreshold,
      }}
    >
      {children}
    </EggContext.Provider>
  );
}
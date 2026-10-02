export type LocationType = 'continent' | 'ocean' | 'sea';

export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: LocationType;
}

export const WORLD_LOCATIONS: LocationData[] = [
  // Continents
  { id: 'c_na', name: 'NORTH AMERICA', lat: 45, lon: -100, type: 'continent' },
  { id: 'c_sa', name: 'SOUTH AMERICA', lat: -15, lon: -60, type: 'continent' },
  { id: 'c_eu', name: 'EUROPE', lat: 50, lon: 15, type: 'continent' },
  { id: 'c_af', name: 'AFRICA', lat: 5, lon: 20, type: 'continent' },
  { id: 'c_as', name: 'ASIA', lat: 45, lon: 90, type: 'continent' },
  { id: 'c_au', name: 'AUSTRALIA', lat: -25, lon: 135, type: 'continent' },
  { id: 'c_an', name: 'ANTARCTICA', lat: -80, lon: 0, type: 'continent' },

  // Oceans
  { id: 'o_ar', name: 'ARCTIC OCEAN', lat: 85, lon: 0, type: 'ocean' },
  { id: 'o_pa_n', name: 'PACIFIC OCEAN', lat: 10, lon: -150, type: 'ocean' },
  { id: 'o_at', name: 'ATLANTIC OCEAN', lat: 10, lon: -35, type: 'ocean' },
  { id: 'o_in', name: 'INDIAN OCEAN', lat: -20, lon: 80, type: 'ocean' },
  { id: 'o_so', name: 'SOUTHERN OCEAN', lat: -60, lon: 0, type: 'ocean' },

  // Seas
  { id: 's_beaufort', name: 'Beaufort Sea', lat: 72, lon: -137, type: 'sea' },
  { id: 's_baffin', name: 'Baffin Bay', lat: 73, lon: -68, type: 'sea' },
  { id: 's_labrador', name: 'Labrador Sea', lat: 60, lon: -55, type: 'sea' },
  { id: 's_hudson', name: 'Hudson Bay', lat: 60, lon: -85, type: 'sea' },
  { id: 's_bering', name: 'Bering Sea', lat: 58, lon: 178, type: 'sea' }, 
  { id: 's_gom', name: 'Gulf of Mexico', lat: 25, lon: -90, type: 'sea' },
  { id: 's_carib', name: 'Caribbean Sea', lat: 15, lon: -75, type: 'sea' },
  
  { id: 's_norwegian', name: 'Norwegian Sea', lat: 68, lon: 5, type: 'sea' },
  { id: 's_greenland', name: 'Greenland Sea', lat: 76, lon: -8, type: 'sea' },
  { id: 's_north', name: 'North Sea', lat: 56, lon: 3, type: 'sea' },
  { id: 's_baltic', name: 'Baltic Sea', lat: 59, lon: 20, type: 'sea' },
  { id: 's_barents', name: 'Barents Sea', lat: 75, lon: 40, type: 'sea' },
  { id: 's_kara', name: 'Kara Sea', lat: 75, lon: 70, type: 'sea' },
  { id: 's_laptev', name: 'Laptev Sea', lat: 76, lon: 125, type: 'sea' },
  { id: 's_e_siberian', name: 'East Siberian Sea', lat: 72, lon: 163, type: 'sea' },
  { id: 's_chukchi', name: 'Chukchi Sea', lat: 69, lon: -168, type: 'sea' },
  
  { id: 's_med', name: 'Mediterranean Sea', lat: 35, lon: 18, type: 'sea' },
  { id: 's_arabian', name: 'Arabian Sea', lat: 15, lon: 65, type: 'sea' },
  { id: 's_bob', name: 'Bay of Bengal', lat: 15, lon: 88, type: 'sea' },
  
  { id: 's_yellow', name: 'Yellow Sea', lat: 35, lon: 124, type: 'sea' },
  { id: 's_east_china', name: 'East China Sea', lat: 28, lon: 126, type: 'sea' },
  { id: 's_south_china', name: 'South China Sea', lat: 12, lon: 113, type: 'sea' },
  { id: 's_phil', name: 'Philippine Sea', lat: 20, lon: 135, type: 'sea' },
  { id: 's_japan', name: 'Sea of Japan (East Sea)', lat: 40, lon: 135, type: 'sea' },
  { id: 's_okhotsk', name: 'Sea of Okhotsk', lat: 55, lon: 150, type: 'sea' },
  
  { id: 's_coral', name: 'Coral Sea', lat: -18, lon: 155, type: 'sea' },
  { id: 's_tasman', name: 'Tasman Sea', lat: -38, lon: 160, type: 'sea' },
];

export const categories = [
  { label: 'Plot', icon: 'home', count: 0 },
  { label: 'Flat', icon: 'building', count: 0 },
  { label: 'PG Room', icon: 'bed', count: 0 },
];

export const plotAmenitiesList = [
  'Boundary Wall',
  'Water',
  'Electricity',
  'Road Access',
  'Gated Community',
  'Street Lights',
  'Sewage Connection',
  'Park Nearby',
  'School Nearby',
  'Hospital Nearby',
  'Metro Nearby',
  'Market Nearby',
];

export const flatAmenitiesList = [
  'Parking',
  'Lift',
  'Security',
  'Gym',
  'Swimming Pool',
  'Power Backup',
  'Park',
  'Clubhouse',
  'CCTV',
  'Fire Safety',
  'Rainwater Harvesting',
  'Children Play Area',
  'Community Hall',
  'Garden',
];

export const pgAmenitiesList = [
  'WiFi',
  'AC',
  'Bed',
  'Wardrobe',
  'Study Table',
  'Washing Machine',
  'Geyser',
  'Food',
  'Housekeeping',
  'CCTV',
  'Security',
  'Parking',
  'Power Backup',
  'TV',
  'Refrigerator',
  'Microwave',
  'Iron',
  'Room Service',
];

export const amenitiesList = [
  ...new Set([...plotAmenitiesList, ...flatAmenitiesList, ...pgAmenitiesList]),
];

export const cities = [
  'Noida',
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
];

export const areaUnits = [
  { value: 'SQ_FT', label: 'Sq. Ft.' },
  { value: 'SQ_YARD', label: 'Sq. Yard' },
  { value: 'SQ_METER', label: 'Sq. Meter' },
  { value: 'ACRE', label: 'Acre' },
  { value: 'HECTARE', label: 'Hectare' },
];

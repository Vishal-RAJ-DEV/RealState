import type { PropertyWithDetails } from "@/types";

export function mapPropertyToFrontend(property: PropertyWithDetails) {
  const images = property.images.length > 0 ? property.images : ['/images/placeholder.jpg'];

  const details = mapDetails(property);

  const primaryArea = getPrimaryArea(property);

  return {
    id: property.id,
    title: property.title,
    description: property.description,
    type: property.type,
    listingType: property.listingFor === 'SALE' ? 'Sale' : 'Rent',
    price: property.price,
    location: `${property.city}, ${property.locality}`.trim().replace(/^, /, '').replace(/,$/, ''),
    city: property.city,
    locality: property.locality,
    address: property.address || `${property.city}, ${property.locality}`,
    latitude: property.latitude,
    longitude: property.longitude,
    images,
    amenities: property.amenities || [],
    status: property.status,
    views: property.views,
    leads: property._count.leads,
    owner: {
      id: property.seller.id,
      name: property.seller.name,
      phone: property.seller.phone || '',
      memberSince: property.seller.createdAt.getFullYear().toString(),
      avatar: property.seller.image || '/images/agent_avatar.jpg',
    },
    postedDate: property.createdAt.toISOString().split('T')[0],
    beds: getBeds(property),
    baths: getBaths(property),
    sqft: primaryArea,
    pricePerSqft: primaryArea && primaryArea > 0 ? Math.round(property.price / primaryArea) : 0,
    details,
  };
}

function getBeds(property: PropertyWithDetails): number {
  if (property.type === 'FLAT' && property.flatDetails) {
    return property.flatDetails.bedrooms;
  }
  if (property.type === 'PG_ROOM' && property.pgDetails) {
    return property.pgDetails.totalBeds ?? 0;
  }
  return 0;
}

function getBaths(property: PropertyWithDetails): number {
  if (property.type === 'FLAT' && property.flatDetails) {
    return property.flatDetails.bathrooms;
  }
  if (property.type === 'PG_ROOM' && property.pgDetails) {
    return property.pgDetails.attachedBathroom ? 1 : 0;
  }
  return 0;
}

function getPrimaryArea(property: PropertyWithDetails): number {
  if (property.type === 'PLOT' && property.plotDetails) {
    return property.plotDetails.area;
  }
  if (property.type === 'FLAT' && property.flatDetails) {
    return property.flatDetails.builtUpArea ?? property.flatDetails.carpetArea ?? 0;
  }
  if (property.type === 'PG_ROOM' && property.pgDetails) {
    return property.pgDetails.roomSize ?? 0;
  }
  return 0;
}

function mapDetails(property: PropertyWithDetails) {
  if (property.type === 'PLOT' && property.plotDetails) {
    return {
      plotType: property.plotDetails.plotType,
      area: property.plotDetails.area,
      areaUnit: property.plotDetails.areaUnit,
      length: property.plotDetails.length,
      width: property.plotDetails.width,
      facing: property.plotDetails.facing,
      roadWidth: property.plotDetails.roadWidth,
      nearPlaces: property.plotDetails.nearPlaces,
      boundaryWall: property.plotDetails.boundaryWall,
      waterAvailable: property.plotDetails.waterAvailable,
      electricityAvailable: property.plotDetails.electricityAvailable,
    };
  }

  if (property.type === 'FLAT' && property.flatDetails) {
    return {
      bedrooms: property.flatDetails.bedrooms,
      bathrooms: property.flatDetails.bathrooms,
      carpetArea: property.flatDetails.carpetArea,
      builtUpArea: property.flatDetails.builtUpArea,
      areaUnit: property.flatDetails.areaUnit,
      floor: property.flatDetails.floor,
      totalFloors: property.flatDetails.totalFloors,
      furnished: property.flatDetails.furnished,
      facing: property.flatDetails.facing,
      age: property.flatDetails.age,
      balconies: property.flatDetails.balconies,
      parking: property.flatDetails.parking,
      roomSize: property.flatDetails.roomSize,
    };
  }

  if (property.type === 'PG_ROOM' && property.pgDetails) {
    return {
      roomSize: property.pgDetails.roomSize,
      areaUnit: property.pgDetails.areaUnit,
      sharingType: property.pgDetails.sharingType,
      totalBeds: property.pgDetails.totalBeds,
      availableBeds: property.pgDetails.availableBeds,
      genderPreference: property.pgDetails.genderPreference,
      attachedBathroom: property.pgDetails.attachedBathroom,
      balcony: property.pgDetails.balcony,
      furnished: property.pgDetails.furnished,
      foodAvailable: property.pgDetails.foodAvailable,
      foodType: property.pgDetails.foodType,
      monthlyRent: property.pgDetails.monthlyRent,
      securityDeposit: property.pgDetails.securityDeposit,
      maintenanceCharge: property.pgDetails.maintenanceCharge,
    };
  }

  return null;
}

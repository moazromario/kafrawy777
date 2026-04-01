/**
 * Helper for OpenStreetMap Nominatim Geocoding
 */

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'ar', // Prefer Arabic
          'User-Agent': 'KafrawyGo-App'
        }
      }
    );
    const data = await response.json();
    return data.display_name;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function searchAddress(query: string) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'Accept-Language': 'ar',
          'User-Agent': 'KafrawyGo-App'
        }
      }
    );
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.place_id,
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

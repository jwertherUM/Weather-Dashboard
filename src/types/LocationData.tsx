export type LocationData = {
  address: {
    state?: string;
    country: string;
    country_code: string;
    postcode?: string;
  };
  display_name: string;
  lat: string;
  lon: string;
};

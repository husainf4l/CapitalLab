export interface Branch {
  id: string;
  name: string;
  nameAr?: string;
  address: string;
  addressAr?: string;
  city: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  openingHours: OpeningHours[];
  isActive: boolean;
  imageUrl?: string;
}

export interface OpeningHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  priceKES: number;
  durationMinutes?: number;
  description?: string;
}

export interface ClientConfig {
  slug: string;
  businessName: string;
  whatsappNumber: string; // Format: 2547XXXXXXXX
  tagline: string;
  vertical: 'salon' | 'garage' | 'cafe';
  services: ServiceItem[];
}

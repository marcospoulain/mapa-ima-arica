export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          title: string;
          type: string;
          price: number;
          location: string;
          description: string;
          bedrooms: number;
          bathrooms: number;
          area: number;
          coordinates: Json; // { lat: number, lng: number }
          image_url: string;
          features: Json; // string[]
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: string;
          price: number;
          location: string;
          description: string;
          bedrooms: number;
          bathrooms: number;
          area: number;
          coordinates: Json; // { lat: number, lng: number }
          image_url: string;
          features?: Json; // string[]
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: string;
          price?: number;
          location?: string;
          description?: string;
          bedrooms?: number;
          bathrooms?: number;
          area?: number;
          coordinates?: Json; // { lat: number, lng: number }
          image_url?: string;
          features?: Json; // string[]
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
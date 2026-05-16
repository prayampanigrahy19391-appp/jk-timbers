export interface StaticProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  badge?: string | null;
  description: string;
  features: string[];
  origin: string;
  stock: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  unit: string;
  image: string;
  quantity: number;
}
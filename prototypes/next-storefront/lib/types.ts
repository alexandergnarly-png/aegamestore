export type Product = {
  id: number;
  game: string;
  brand: string;
  duration: string;
  price: number;
  active: number;
  delivery_type?: string;

  // kemungkinan field stock dari backend
  stock?: number;
  stock_count?: number;
  available_stock?: number;
};
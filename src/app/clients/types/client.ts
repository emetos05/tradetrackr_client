// Client interface for frontend, matching API DTO
export interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

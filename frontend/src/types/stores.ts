export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
}

export interface StoreResponse {
  success: boolean;
  data: Store[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalStores: number;
  };
}

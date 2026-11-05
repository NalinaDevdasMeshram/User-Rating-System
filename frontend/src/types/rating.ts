export interface MyRating {
  id: string;
  rating: number;
  storeId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    address: string;
  };
}

export interface MyRatingsResponse {
  success: boolean;
  totalRatings: number;
  data: MyRating[];
}

export interface OwnerDashboardResponse {
  success: boolean;
  data: {
    store: {
      id: string;
      name: string;
      email: string;
      address: string;
    };
    averageRating: number;
    totalRatings: number;
    ratings: {
      id: string;
      rating: number;
      createdAt: string;
      user: {
        name: string;
        email: string;
      };
    }[];
  };
}

export interface FoodCategory {
  id: string;
  nameKa: string;
  nameEn: string;
}

export interface MenuItem {
  id: string;
  nameKa: string;
  nameEn: string;
  descriptionKa: string;
  descriptionEn: string;
  price: number | null;
  imageUrl: string;
  videoUrl: string;
  preparationTimeMinutes: number | null;
  isAvailable: boolean;
  volume: string;
  alcoholContent: string;
  ingredients: string;
  ingredientsEn: string;
  isVeganFood: boolean;
  comment: string;
  calories: number | null;
  spicyLevel: number | null;
  foodCategoryId: string;
  foodCategory?: FoodCategory;
}

export interface MenuItemFormData extends Omit<MenuItem, 'id' | 'foodCategory'> {
  id?: string;
}

import type { MenuItem, FoodCategory } from '../types/menu';

export const mockCategories: FoodCategory[] = [
  { id: '1', nameKa: 'ცხელი კერძები', nameEn: 'Hot Dishes' },
  { id: '2', nameKa: 'სალათები', nameEn: 'Salads' },
  { id: '3', nameKa: 'სასმელები', nameEn: 'Beverages' },
  { id: '4', nameKa: 'დესერტები', nameEn: 'Desserts' },
];

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    nameKa: 'ქართული ხაჭაპური',
    nameEn: 'Georgian Khachapuri',
    descriptionKa: 'ტრადიციული ქართული ხაჭაპური სულგუნის ყველით',
    descriptionEn: 'Traditional Georgian cheese bread with Sulguni cheese',
    price: 12.50,
    imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=400',
    videoUrl: '',
    preparationTimeMinutes: 25,
    isAvailable: true,
    volume: '350გრ',
    alcoholContent: '',
    ingredients: 'ფქვილი, სულგუნი, კვერცხი, რძე',
    ingredientsEn: 'Flour, Sulguni cheese, Egg, Milk',
    isVeganFood: false,
    comment: 'ცხელი მიირთვით',
    calories: 450,
    spicyLevel: 0,
    foodCategoryId: '1',
    foodCategory: mockCategories[0],
  },
  {
    id: '2',
    nameKa: 'ბოსტნეულის სალათი',
    nameEn: 'Vegetable Salad',
    descriptionKa: 'სეზონური ბოსტნეულის სალათი',
    descriptionEn: 'Fresh seasonal vegetable salad',
    price: 8.00,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    videoUrl: '',
    preparationTimeMinutes: 10,
    isAvailable: true,
    volume: '250გრ',
    alcoholContent: '',
    ingredients: 'პომიდორი, კიტრი, ბულგარული წიწაკა, სალათის ფოთოლი',
    ingredientsEn: 'Tomato, Cucumber, Bell pepper, Lettuce',
    isVeganFood: true,
    comment: '',
    calories: 120,
    spicyLevel: 0,
    foodCategoryId: '2',
    foodCategory: mockCategories[1],
  },
  {
    id: '3',
    nameKa: 'ლიმონათი',
    nameEn: 'Lemonade',
    descriptionKa: 'ახლად გამოწურული ლიმონათი',
    descriptionEn: 'Freshly squeezed lemonade',
    price: 5.00,
    imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400',
    videoUrl: '',
    preparationTimeMinutes: 5,
    isAvailable: true,
    volume: '300მლ',
    alcoholContent: '',
    ingredients: 'ლიმონი, წყალი, შაქარი, პიტნა',
    ingredientsEn: 'Lemon, Water, Sugar, Mint',
    isVeganFood: true,
    comment: 'გამაგრილებელი',
    calories: 90,
    spicyLevel: 0,
    foodCategoryId: '3',
    foodCategory: mockCategories[2],
  },
];

// Mock API functions
export const mockAPI = {
  getMenuItems: async (): Promise<MenuItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMenuItems), 500);
    });
  },

  getCategories: async (): Promise<FoodCategory[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCategories), 300);
    });
  },

  addMenuItem: async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem = {
          ...item,
          id: String(Date.now()),
        };
        mockMenuItems.push(newItem);
        resolve(newItem);
      }, 500);
    });
  },

  updateMenuItem: async (item: MenuItem): Promise<MenuItem> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockMenuItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          mockMenuItems[index] = item;
        }
        resolve(item);
      }, 500);
    });
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockMenuItems.findIndex(i => i.id === id);
        if (index !== -1) {
          mockMenuItems.splice(index, 1);
        }
        resolve();
      }, 500);
    });
  },
};

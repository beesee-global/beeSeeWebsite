// Base Category type
export type Category = {
    id: number;
    name: string;
    icon: string;
};

// Type without `id` (for creation)
export type CategoryWithoutId = Omit<Category, 'id'>;

// Type for updating a category (id is required to identify)
export type UpdateCategoryDTO = Partial<Omit<Category, 'id'>> & { id: number };

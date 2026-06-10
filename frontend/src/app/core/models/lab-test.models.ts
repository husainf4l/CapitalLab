export interface TestCategory {
  id: string;
  name: string;
  nameAr?: string;
  icon?: string;
  description?: string;
  testsCount?: number;
}

export interface LabTest {
  id: string;
  name: string;
  nameAr?: string;
  code: string;
  categoryId: string;
  category?: TestCategory;
  description?: string;
  descriptionAr?: string;
  price: number;
  sampleType: string;
  sampleTypeAr?: string;
  turnaroundTime: string;
  preparationInstructions?: string;
  preparationInstructionsAr?: string;
  isHomeCollectionAvailable: boolean;
  isActive: boolean;
  popularityScore?: number;
}

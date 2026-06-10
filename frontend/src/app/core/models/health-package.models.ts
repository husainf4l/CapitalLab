export interface HealthPackage {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  originalPrice?: number;
  tests: PackageTest[];
  testsCount?: number;
  isPopular: boolean;
  isActive: boolean;
  imageUrl?: string;
  targetGender?: 'male' | 'female' | 'all';
  ageGroup?: string;
  turnaroundTime?: string;
}

export interface PackageTest {
  testId: string;
  testName: string;
  testCode: string;
}

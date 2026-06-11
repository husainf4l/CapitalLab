export interface HealthPackage {
  id: string;
  code?: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;           // base price before discount
  discountPercentage?: number;
  effectivePrice?: number; // price after discount (use this for display)
  originalPrice?: number;  // alias kept for legacy usage
  tests?: PackageTest[];
  testsCount?: number;
  testCount?: number;      // backend summary uses testCount
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

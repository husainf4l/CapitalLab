export interface Patient {
  id: string;
  nationalId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone: string;
  email?: string;
  address?: string;
  bloodType?: string;
  userId?: string;
  familyMembers?: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  relationship: string;
  nationalId?: string;
  phone?: string;
}

export type Relationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'other';

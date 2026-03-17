export interface Village {
  id: string;
  state: string;
  name: string;
  description: string;
  member_count: number;
  created_at: string;
}

export interface Member {
  id: string;
  village_id: string;
  village_name?: string;
  full_name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  occupation: string;
  address: string;
  created_at: string;
}

export interface Stats {
  totalPopulation: number;
  villageCounts: { name: string; count: number }[];
  genderStats: { gender: string; count: number }[];
  ageStats: { age_group: string; count: number }[];
}

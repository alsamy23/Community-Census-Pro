import { Stats, Village, Member } from '../types';

const STORAGE_KEY_VILLAGES = 'census_mock_villages';
const STORAGE_KEY_MEMBERS = 'census_mock_members';

const initialVillages: Village[] = [
  { id: 'v1', name: 'Green Valley', state: 'Maharashtra', description: 'A peaceful village with lush greenery.', created_at: new Date().toISOString(), member_count: 0 },
  { id: 'v2', name: 'Blue River', state: 'Karnataka', description: 'Located near the crystal clear river.', created_at: new Date().toISOString(), member_count: 0 }
];

const initialMembers: Member[] = [
  { id: 'm1', full_name: 'John Doe', age: 28, gender: 'Male', village_id: 'v1', village_name: 'Green Valley', phone: '1234567890', occupation: 'Farmer', address: 'House 1, Green Valley', created_at: new Date().toISOString() },
  { id: 'm2', full_name: 'Jane Smith', age: 24, gender: 'Female', village_id: 'v1', village_name: 'Green Valley', phone: '0987654321', occupation: 'Teacher', address: 'House 2, Green Valley', created_at: new Date().toISOString() }
];

function getStored<T>(key: string, initial: T): T {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initial;
}

function setStored<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const mockService = {
  async getVillages(): Promise<Village[]> {
    const villages = getStored(STORAGE_KEY_VILLAGES, initialVillages);
    const members = getStored(STORAGE_KEY_MEMBERS, initialMembers);
    
    return villages.map(v => ({
      ...v,
      member_count: members.filter(m => m.village_id === v.id).length
    }));
  },

  async addVillage(villageData: any) {
    const villages = getStored(STORAGE_KEY_VILLAGES, initialVillages);
    const newVillage = {
      ...villageData,
      id: 'v' + Date.now(),
      created_at: new Date().toISOString(),
      member_count: 0
    };
    setStored(STORAGE_KEY_VILLAGES, [...villages, newVillage]);
    return newVillage.id;
  },

  async deleteVillage(villageId: string) {
    const villages = getStored(STORAGE_KEY_VILLAGES, initialVillages);
    const members = getStored(STORAGE_KEY_MEMBERS, initialMembers);
    
    setStored(STORAGE_KEY_VILLAGES, villages.filter(v => v.id !== villageId));
    setStored(STORAGE_KEY_MEMBERS, members.filter(m => m.village_id !== villageId));
  },

  async getVillage(id: string): Promise<Village | null> {
    const villages = await this.getVillages();
    return villages.find(v => v.id === id) || null;
  },

  async getMembers(villageId?: string): Promise<Member[]> {
    const members = getStored(STORAGE_KEY_MEMBERS, initialMembers);
    const villages = getStored(STORAGE_KEY_VILLAGES, initialVillages);
    
    let filtered = members;
    if (villageId) {
      filtered = members.filter(m => m.village_id === villageId);
    }
    
    return filtered.map(m => ({
      ...m,
      village_name: villages.find(v => v.id === m.village_id)?.name || 'Unknown'
    }));
  },

  async addMember(memberData: any) {
    const members = getStored(STORAGE_KEY_MEMBERS, initialMembers);
    const newMember = {
      ...memberData,
      id: 'm' + Date.now(),
      created_at: new Date().toISOString()
    };
    setStored(STORAGE_KEY_MEMBERS, [...members, newMember]);
    return newMember.id;
  },

  async deleteMember(memberId: string) {
    const members = getStored(STORAGE_KEY_MEMBERS, initialMembers);
    setStored(STORAGE_KEY_MEMBERS, members.filter(m => m.id !== memberId));
  },

  async getStats(): Promise<Stats> {
    const members = getStored(STORAGE_KEY_MEMBERS, initialMembers);
    const villages = getStored(STORAGE_KEY_VILLAGES, initialVillages);
    
    const totalPopulation = members.length;
    
    const villageCounts = villages.map(v => ({
      name: v.name,
      count: members.filter(m => m.village_id === v.id).length
    }));

    const genderStats = [
      { gender: 'Male', count: members.filter(m => m.gender === 'Male').length },
      { gender: 'Female', count: members.filter(m => m.gender === 'Female').length },
      { gender: 'Other', count: members.filter(m => m.gender === 'Other').length }
    ].filter(s => s.count > 0);

    const ageStats = [
      { age_group: '0-17', count: members.filter(m => m.age < 18).length },
      { age_group: '18-35', count: members.filter(m => m.age >= 18 && m.age <= 35).length },
      { age_group: '36-60', count: members.filter(m => m.age > 35 && m.age <= 60).length },
      { age_group: '60+', count: members.filter(m => m.age > 60).length }
    ];

    return { totalPopulation, villageCounts, genderStats, ageStats };
  }
};

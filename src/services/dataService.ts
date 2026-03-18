import { firebaseService } from './firebaseService';
import { mockService } from './mockService';
import { Stats, Village, Member } from '../types';
import { db } from './firebaseConfig';

const IS_DEMO_MODE = localStorage.getItem('census_demo_mode') === 'true';
let autoDemoMode = !db;

const handleFirebaseError = (err: any) => {
  console.error("Firebase Service Error:", err);
  const isConfigError = 
    err.message?.includes('Cloud Firestore API has not been used') || 
    err.message?.includes('disabled') ||
    err.message?.includes('Missing or insufficient permissions') || 
    err.message?.includes('Firebase Project ID is missing') ||
    err.code === 'permission-denied' ||
    err.code === 'failed-precondition';

  if (isConfigError && !IS_DEMO_MODE) {
    console.warn("Switching to Auto-Demo Mode due to Firebase configuration issues.");
    autoDemoMode = true;
    return true; // Handled
  }
  return false;
};

export const dataService = {
  get isDemo() {
    return IS_DEMO_MODE || autoDemoMode;
  },

  get isAutoDemo() {
    return autoDemoMode;
  },

  setDemo(value: boolean) {
    localStorage.setItem('census_demo_mode', value.toString());
    autoDemoMode = false;
    window.location.reload();
  },

  async getVillages(): Promise<Village[]> {
    if (this.isDemo) return mockService.getVillages();
    try {
      return await firebaseService.getVillages();
    } catch (err) {
      if (handleFirebaseError(err)) return mockService.getVillages();
      throw err;
    }
  },

  async addVillage(villageData: any) {
    if (this.isDemo) return mockService.addVillage(villageData);
    try {
      return await firebaseService.addVillage(villageData);
    } catch (err) {
      if (handleFirebaseError(err)) return mockService.addVillage(villageData);
      throw err;
    }
  },

  async deleteVillage(villageId: string) {
    if (this.isDemo) return mockService.deleteVillage(villageId);
    try {
      return await firebaseService.deleteVillage(villageId);
    } catch (err) {
      if (handleFirebaseError(err)) return mockService.deleteVillage(villageId);
      throw err;
    }
  },

  async getVillage(id: string): Promise<Village | null> {
    if (this.isDemo) return mockService.getVillage(id);
    try {
      return await firebaseService.getVillage(id);
    } catch (err) {
      if (handleFirebaseError(err)) return mockService.getVillage(id);
      throw err;
    }
  },

  async getMembers(villageId?: string): Promise<Member[]> {
    if (this.isDemo) return mockService.getMembers(villageId);
    try {
      return await firebaseService.getMembers(villageId);
    } catch (err) {
      if (handleFirebaseError(err)) return mockService.getMembers(villageId);
      throw err;
    }
  },

  async addMember(memberData: any) {
    if (this.isDemo) return mockService.addMember(memberData);
    try {
      return await firebaseService.addMember(memberData);
    } catch (err) {
      if (handleFirebaseError(err)) return mockService.addMember(memberData);
      throw err;
    }
  },

  async deleteMember(memberId: string) {
    if (this.isDemo) return mockService.deleteMember(memberId);
    try {
      return await firebaseService.deleteMember(memberId);
    } catch (err) {
      if (handleFirebaseError(err)) return mockService.deleteMember(memberId);
      throw err;
    }
  },

  async getStats(): Promise<Stats> {
    if (this.isDemo) return mockService.getStats();
    try {
      return await firebaseService.getStats();
    } catch (err) {
      if (handleFirebaseError(err)) return mockService.getStats();
      throw err;
    }
  },

  async getAllDataForBackup(): Promise<any> {
    if (this.isDemo) return mockService.getAllDataForBackup();
    try {
      return await firebaseService.getAllDataForBackup();
    } catch (err) {
      if (handleFirebaseError(err)) return mockService.getAllDataForBackup();
      throw err;
    }
  }
};

import { db, auth } from './firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, getCountFromServer } from 'firebase/firestore';
import { Stats, Village, Member } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  async getVillages(): Promise<Village[]> {
    try {
      if (!db) throw new Error("Database not initialized");
      const vSnap = await getDocs(collection(db, 'villages'));
      const villages = vSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Village));

      // Fetch counts for each village in parallel
      const counts = await Promise.all(
        villages.map(v => getCountFromServer(query(collection(db, 'members'), where('village_id', '==', v.id))))
      );

      return villages.map((v, i) => ({
        ...v,
        member_count: counts[i].data().count
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'villages');
      return []; // unreachable but for TS
    }
  },

  async addVillage(villageData: any) {
    try {
      if (!db) throw new Error("Database not initialized");
      const docRef = await addDoc(collection(db, 'villages'), {
        ...villageData,
        created_at: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'villages');
    }
  },

  async deleteVillage(villageId: string) {
    try {
      if (!db) throw new Error("Database not initialized");
      await deleteDoc(doc(db, 'villages', villageId));
      const membersQuery = query(collection(db, 'members'), where('village_id', '==', villageId));
      const membersSnapshot = await getDocs(membersQuery);
      membersSnapshot.forEach(async (memberDoc) => {
        await deleteDoc(doc(db, 'members', memberDoc.id));
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `villages/${villageId}`);
    }
  },

  async getVillage(id: string): Promise<Village | null> {
    try {
      if (!db) throw new Error("Database not initialized");
      const [vDoc, countSnap] = await Promise.all([
        getDocs(query(collection(db, 'villages'), where('__name__', '==', id))),
        getCountFromServer(query(collection(db, 'members'), where('village_id', '==', id)))
      ]);

      if (vDoc.empty) return null;
      const data = vDoc.docs[0].data();
      return { id: vDoc.docs[0].id, ...data, member_count: countSnap.data().count } as Village;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `villages/${id}`);
      return null;
    }
  },

  async getMembers(villageId?: string): Promise<Member[]> {
    try {
      if (!db) throw new Error("Database not initialized");
      let q = query(collection(db, 'members'));
      if (villageId) {
        q = query(collection(db, 'members'), where('village_id', '==', villageId));
      }
      
      const [snapshot, vSnap] = await Promise.all([
        getDocs(q),
        getDocs(collection(db, 'villages'))
      ]);

      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      const villages = vSnap.docs.map(d => ({ id: d.id, name: d.data().name }));

      return members.map(m => ({
        ...m,
        village_name: villages.find(v => v.id === m.village_id)?.name || 'Unknown'
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'members');
      return [];
    }
  },

  async addMember(memberData: any) {
    try {
      if (!db) throw new Error("Database not initialized");
      const docRef = await addDoc(collection(db, 'members'), {
        ...memberData,
        created_at: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'members');
    }
  },

  async deleteMember(memberId: string) {
    try {
      if (!db) throw new Error("Database not initialized");
      await deleteDoc(doc(db, 'members', memberId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `members/${memberId}`);
    }
  },

  async getStats(): Promise<Stats> {
    try {
      if (!db) throw new Error("Database not initialized");
      const villagesSnapshot = await getDocs(collection(db, 'villages'));
      const villages = villagesSnapshot.docs.map(d => ({ id: d.id, name: d.data().name }));

      const [
        totalPopSnap,
        maleSnap,
        femaleSnap,
        otherSnap,
        age1Snap,
        age2Snap,
        age3Snap,
        age4Snap,
        ...villageSnaps
      ] = await Promise.all([
        getCountFromServer(collection(db, 'members')),
        getCountFromServer(query(collection(db, 'members'), where('gender', '==', 'Male'))),
        getCountFromServer(query(collection(db, 'members'), where('gender', '==', 'Female'))),
        getCountFromServer(query(collection(db, 'members'), where('gender', '==', 'Other'))),
        getCountFromServer(query(collection(db, 'members'), where('age', '<', 18))),
        getCountFromServer(query(collection(db, 'members'), where('age', '>=', 18), where('age', '<=', 35))),
        getCountFromServer(query(collection(db, 'members'), where('age', '>', 35), where('age', '<=', 60))),
        getCountFromServer(query(collection(db, 'members'), where('age', '>', 60))),
        ...villages.map(v => getCountFromServer(query(collection(db, 'members'), where('village_id', '==', v.id))))
      ]);

      const totalPopulation = totalPopSnap.data().count;
      
      const genderStats = [
        { gender: 'Male', count: maleSnap.data().count },
        { gender: 'Female', count: femaleSnap.data().count },
        { gender: 'Other', count: otherSnap.data().count }
      ].filter(s => s.count > 0);

      const ageStats = [
        { age_group: '0-17', count: age1Snap.data().count },
        { age_group: '18-35', count: age2Snap.data().count },
        { age_group: '36-60', count: age3Snap.data().count },
        { age_group: '60+', count: age4Snap.data().count }
      ];

      const villageCounts = villages.map((v, i) => ({
        name: v.name,
        count: villageSnaps[i].data().count
      }));

      return { totalPopulation, villageCounts, genderStats, ageStats };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'stats');
      return { totalPopulation: 0, villageCounts: [], genderStats: [], ageStats: [] };
    }
  }
};

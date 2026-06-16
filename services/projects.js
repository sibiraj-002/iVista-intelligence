import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const COLLECTION_NAME = "projects";

async function getDb() {
  const { db } = await import("@/firebase/config");

  return db;
}

function serializeProject(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
  };
}

export async function getProjects() {
  const db = await getDb();
  const projectsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(projectsQuery);

  return snapshot.docs.map(serializeProject);
}

export async function getProject(projectId) {
  const db = await getDb();
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, projectId));

  if (!snapshot.exists()) {
    return null;
  }

  return serializeProject(snapshot);
}

export async function addProject(project) {
  const db = await getDb();

  return addDoc(collection(db, COLLECTION_NAME), {
    name: project.name,
    website: project.website,
    googleAdsCustomerId: project.googleAdsCustomerId,
    ga4PropertyId: project.ga4PropertyId,
    industry: project.industry,
    status: project.status,
    createdAt: serverTimestamp(),
  });
}

export async function updateProject(projectId, project) {
  const db = await getDb();

  return updateDoc(doc(db, COLLECTION_NAME, projectId), {
    name: project.name,
    website: project.website,
    googleAdsCustomerId: project.googleAdsCustomerId,
    ga4PropertyId: project.ga4PropertyId,
    industry: project.industry,
    status: project.status,
  });
}

export async function deleteProject(projectId) {
  const db = await getDb();

  return deleteDoc(doc(db, COLLECTION_NAME, projectId));
}

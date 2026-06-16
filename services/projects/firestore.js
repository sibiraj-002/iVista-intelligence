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
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
  };
}

function toProjectPayload(project) {
  return {
    name: project.name,
    website: project.website,
    googleAdsCustomerId: project.googleAdsCustomerId || "",
    ga4PropertyId: project.ga4PropertyId || "",
    searchConsoleSiteUrl: project.searchConsoleSiteUrl || "",
    industry: project.industry,
    status: project.status,
  };
}

export async function getProjectsFromFirestore() {
  const db = await getDb();
  const projectsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(projectsQuery);

  return snapshot.docs.map(serializeProject);
}

export async function getProjectFromFirestore(projectId) {
  const db = await getDb();
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, projectId));

  if (!snapshot.exists()) {
    return null;
  }

  return serializeProject(snapshot);
}

export async function addProjectToFirestore(project) {
  const db = await getDb();
  const projectRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...toProjectPayload(project),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: projectRef.id,
  };
}

export async function updateProjectInFirestore(projectId, project) {
  const db = await getDb();

  await updateDoc(doc(db, COLLECTION_NAME, projectId), {
    ...toProjectPayload(project),
    updatedAt: serverTimestamp(),
  });

  return getProjectFromFirestore(projectId);
}

export async function deleteProjectFromFirestore(projectId) {
  const db = await getDb();

  await deleteDoc(doc(db, COLLECTION_NAME, projectId));

  return {
    id: projectId,
  };
}

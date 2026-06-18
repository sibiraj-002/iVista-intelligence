import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const COLLECTION_NAME = "pageSpeedInsightsReports";

async function getDb() {
  const { db } = await import("@/firebase/config");

  return db;
}

function serializeReport(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
  };
}

export async function getPageSpeedReportFromFirestore(projectId) {
  if (!projectId) {
    return null;
  }

  const db = await getDb();
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, projectId));

  if (!snapshot.exists()) {
    return null;
  }

  return serializeReport(snapshot);
}

export async function savePageSpeedReportToFirestore(projectId, report) {
  if (!projectId) {
    return report;
  }

  const db = await getDb();
  const existingReport = await getPageSpeedReportFromFirestore(projectId);
  const reportPayload = { ...report };
  delete reportPayload.createdAt;
  delete reportPayload.id;
  delete reportPayload.updatedAt;
  const payload = {
    ...reportPayload,
    projectId,
    updatedAt: serverTimestamp(),
  };

  if (!existingReport) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(doc(db, COLLECTION_NAME, projectId), payload, { merge: true });

  return getPageSpeedReportFromFirestore(projectId);
}

export async function updatePageSpeedReportPageInFirestore(projectId, page) {
  const existingReport = await getPageSpeedReportFromFirestore(projectId);
  const existingPages = existingReport?.pages || [];
  const pageExists = existingPages.some((currentPage) => currentPage.url === page.url);
  const pages = pageExists
    ? existingPages.map((currentPage) =>
        currentPage.url === page.url ? page : currentPage
      )
    : [...existingPages, page];

  return savePageSpeedReportToFirestore(projectId, {
    ...(existingReport || {}),
    generatedAt: existingReport?.generatedAt || new Date().toISOString(),
    pages,
    scanStatus: "running",
  });
}

export async function deletePageSpeedReportFromFirestore(projectId) {
  if (!projectId) {
    return {
      id: projectId,
    };
  }

  const db = await getDb();

  await deleteDoc(doc(db, COLLECTION_NAME, projectId));

  return {
    id: projectId,
  };
}

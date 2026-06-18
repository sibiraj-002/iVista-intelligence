import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const COLLECTION_NAME = "aiInsightReports";

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

function removeUndefinedValues(value) {
  if (Array.isArray(value)) {
    return value.map((item) =>
      item === undefined ? null : removeUndefinedValues(item)
    );
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((result, [key, item]) => {
      if (item === undefined) {
        return result;
      }

      result[key] = removeUndefinedValues(item);
      return result;
    }, {});
  }

  return value;
}

export async function getAiInsightReportFromFirestore(projectId) {
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

export async function getAiInsightReportsFromFirestore() {
  const db = await getDb();
  const reportsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(reportsQuery);

  return snapshot.docs.map(serializeReport);
}

export async function saveAiInsightReportToFirestore(projectId, report) {
  if (!projectId) {
    return report;
  }

  const db = await getDb();
  const existingReport = await getAiInsightReportFromFirestore(projectId);
  const reportPayload = removeUndefinedValues({ ...report });

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

  return getAiInsightReportFromFirestore(projectId);
}

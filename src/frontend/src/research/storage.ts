import type { BacktestResult, Dataset } from "@/types";

const DATABASE_NAME = "convergence-lab";
const DATASETS_STORE = "datasets";
const RESULTS_KEY = "convergence-lab.results.v1";

export async function loadDatasets(): Promise<Dataset[]> {
  if (!("indexedDB" in globalThis)) return [];
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(DATASETS_STORE, "readonly")
      .objectStore(DATASETS_STORE)
      .getAll();
    request.onsuccess = () => resolve(request.result as Dataset[]);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDatasets(datasets: Dataset[]): Promise<void> {
  if (!("indexedDB" in globalThis)) return;
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(DATASETS_STORE, "readwrite");
    const store = transaction.objectStore(DATASETS_STORE);
    store.clear();
    for (const dataset of datasets) store.put(dataset);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export function loadResults(): BacktestResult[] {
  return read<BacktestResult[]>(RESULTS_KEY, []);
}

export function saveResults(results: BacktestResult[]): void {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 50)));
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DATASETS_STORE)) {
        database.createObjectStore(DATASETS_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function read<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

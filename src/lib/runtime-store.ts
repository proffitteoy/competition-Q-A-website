import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  applications as seedApplications,
  competitions as seedCompetitions,
  notices as seedNotices,
  users as seedUsers,
  type ApplicationRecord,
  type Competition,
  type NoticeRecord,
  type PlatformUser,
} from "@/lib/mock-data";

export interface RegistrationAuditLog {
  id: string;
  applicationId: string;
  fromStatus: ApplicationRecord["status"];
  toStatus: ApplicationRecord["status"];
  action: string;
  operator: string;
  comment: string;
  createdAt: string;
}

export interface CompetitionStatusLog {
  id: string;
  competitionId: string;
  fromStatus: string;
  toStatus: string;
  operator: string;
  reason: string;
  createdAt: string;
}

export interface RuntimeStore {
  competitions: Competition[];
  applications: ApplicationRecord[];
  users: PlatformUser[];
  notices: NoticeRecord[];
  registrationAuditLogs: RegistrationAuditLog[];
  competitionStatusLogs: CompetitionStatusLog[];
}

const runtimeDir = path.join(process.cwd(), "runtime");
const runtimeFile = path.join(runtimeDir, "mvp-store.json");

function buildSeedStore(): RuntimeStore {
  return {
    competitions: seedCompetitions,
    applications: seedApplications,
    users: seedUsers,
    notices: seedNotices,
    registrationAuditLogs: [],
    competitionStatusLogs: [],
  };
}

async function ensureStoreFile() {
  if (!existsSync(runtimeDir)) {
    await mkdir(runtimeDir, { recursive: true });
  }
  if (!existsSync(runtimeFile)) {
    await writeFile(runtimeFile, JSON.stringify(buildSeedStore(), null, 2), "utf8");
  }
}

export async function readStore(): Promise<RuntimeStore> {
  await ensureStoreFile();
  const raw = await readFile(runtimeFile, "utf8");
  return JSON.parse(raw) as RuntimeStore;
}

export async function writeStore(nextStore: RuntimeStore): Promise<void> {
  await ensureStoreFile();
  await writeFile(runtimeFile, JSON.stringify(nextStore, null, 2), "utf8");
}

export async function updateStore(
  updater: (store: RuntimeStore) => RuntimeStore,
): Promise<RuntimeStore> {
  const store = await readStore();
  const nextStore = updater(store);
  await writeStore(nextStore);
  return nextStore;
}


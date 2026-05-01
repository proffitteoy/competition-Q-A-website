import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/config";
import {
  competitionAttachments,
  competitions as competitionsTable,
} from "@/lib/db/schema";
import {
  competitions as mockCompetitions,
  hallOfFameEntries as mockHallOfFame,
  type Competition,
  type HallOfFameEntry,
} from "@/lib/mock-data";

import { listCompetitions } from "./competition-repository";
import {
  listPublishedNotices,
  type PublishedNoticeRecord,
} from "./notice-repository";

const FEATURED_STATUS_ORDER: Record<Competition["status"], number> = {
  registration_open: 0,
  upcoming: 1,
  in_progress: 2,
  finished: 3,
  archived: 4,
  draft: 5,
};

export interface HomepageResourceRecord {
  id: string;
  title: string;
  competitionId: string;
  competitionTitle: string;
  competitionSummary: string;
  typeLabel: string;
  href: string;
  downloadHref?: string;
  actionLabel: string;
}

export interface HomepageFaqRecord {
  id: string;
  question: string;
  answer: string;
  competitionId: string;
  competitionTitle: string;
}

export interface HomepagePortalData {
  featuredCompetitions: Competition[];
  latestNotices: PublishedNoticeRecord[];
  resourceLibrary: HomepageResourceRecord[];
  hallOfFameEntries: HallOfFameEntry[];
  featuredFaqs: HomepageFaqRecord[];
}

function getFeaturedCompetitions(competitions: Competition[]) {
  return [...competitions]
    .sort((left, right) => {
      const statusDiff =
        FEATURED_STATUS_ORDER[left.status] - FEATURED_STATUS_ORDER[right.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }
      return left.title.localeCompare(right.title, "zh-CN");
    })
    .slice(0, 6);
}

function getFileTypeLabel(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "PDF 指南";
    case "doc":
    case "docx":
      return "报名文档";
    case "xls":
    case "xlsx":
      return "表格材料";
    case "ppt":
    case "pptx":
      return "演示模板";
    case "zip":
    case "rar":
    case "7z":
      return "资料压缩包";
    case "md":
      return "说明文档";
    default:
      return "赛事资料";
  }
}

function buildAttachmentHref(storageKey: string | null | undefined) {
  if (!storageKey) {
    return undefined;
  }

  return storageKey.startsWith("uploads/") ? `/${storageKey}` : undefined;
}

function buildMockResourceLibrary(limit: number): HomepageResourceRecord[] {
  return mockCompetitions
    .flatMap((competition, competitionIndex) =>
      competition.attachments.map((attachment, attachmentIndex) => ({
        id: `${competition.id}-${attachmentIndex + 1}`,
        title: attachment,
        competitionId: competition.id,
        competitionTitle: competition.title,
        competitionSummary: competition.summary,
        typeLabel: getFileTypeLabel(attachment),
        href: `/competitions/${competition.id}`,
        actionLabel: "查看赛事详情",
        sortIndex: competitionIndex * 10 + attachmentIndex,
      })),
    )
    .sort((left, right) => left.sortIndex - right.sortIndex)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      title: item.title,
      competitionId: item.competitionId,
      competitionTitle: item.competitionTitle,
      competitionSummary: item.competitionSummary,
      typeLabel: item.typeLabel,
      href: item.href,
      actionLabel: item.actionLabel,
    }));
}

async function listHomepageResources(limit = 6) {
  if (!isDatabaseConfigured()) {
    return buildMockResourceLibrary(limit);
  }

  const db = getDb();
  const rows = await db
    .select({
      id: competitionAttachments.id,
      title: competitionAttachments.name,
      competitionId: competitionsTable.id,
      competitionTitle: competitionsTable.title,
      competitionSummary: competitionsTable.summary,
      storageKey: competitionAttachments.storageKey,
    })
    .from(competitionAttachments)
    .innerJoin(
      competitionsTable,
      eq(competitionAttachments.competitionId, competitionsTable.id),
    )
    .where(eq(competitionAttachments.visibility, "public"))
    .orderBy(desc(competitionAttachments.createdAt))
    .limit(limit);

  return rows.map<HomepageResourceRecord>((row) => {
    const downloadHref = buildAttachmentHref(row.storageKey);

    return {
      id: row.id,
      title: row.title,
      competitionId: row.competitionId,
      competitionTitle: row.competitionTitle,
      competitionSummary: row.competitionSummary,
      typeLabel: getFileTypeLabel(row.title),
      href: downloadHref ?? `/competitions/${row.competitionId}`,
      downloadHref,
      actionLabel: downloadHref ? "下载资料" : "查看赛事详情",
    };
  });
}

function buildHomepageFaqs(
  competitions: Competition[],
  limit = 5,
): HomepageFaqRecord[] {
  return competitions
    .flatMap((competition) =>
      competition.faqs.map((faq, index) => ({
        id: `${competition.id}-faq-${index + 1}`,
        question: faq.question,
        answer: faq.answer,
        competitionId: competition.id,
        competitionTitle: competition.title,
      })),
    )
    .slice(0, limit);
}

function getHomepageHallOfFame(): HallOfFameEntry[] {
  return [...mockHallOfFame].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  );
}

export async function getHomepagePortalData(): Promise<HomepagePortalData> {
  const competitions = await listCompetitions();
  const featuredCompetitions = getFeaturedCompetitions(competitions);
  const [latestNotices, resourceLibrary] = await Promise.all([
    listPublishedNotices(4),
    listHomepageResources(6),
  ]);

  return {
    featuredCompetitions,
    latestNotices,
    resourceLibrary,
    hallOfFameEntries: getHomepageHallOfFame(),
    featuredFaqs: buildHomepageFaqs(featuredCompetitions, 5),
  };
}

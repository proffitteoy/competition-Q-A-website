const MISSING_RELATION_CODE = "42P01";
const DRIZZLE_QUERY_ERROR_PREFIX = "Failed query:";

interface DatabaseErrorLike {
  code?: string;
  message?: string;
  cause?: unknown;
}

function getErrorChain(error: unknown) {
  const chain: DatabaseErrorLike[] = [];
  let current: unknown = error;
  let depth = 0;

  while (current && depth < 8) {
    if (typeof current === "object") {
      chain.push(current as DatabaseErrorLike);
      current = (current as DatabaseErrorLike).cause;
    } else {
      break;
    }
    depth += 1;
  }

  return chain;
}

export function isDrizzleQueryError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.startsWith(DRIZZLE_QUERY_ERROR_PREFIX)
  );
}

export function isMissingRelationError(error: unknown, relationName?: string) {
  const chain = getErrorChain(error);
  const hasMissingRelationCode = chain.some(
    (item) => item.code === MISSING_RELATION_CODE,
  );

  if (!hasMissingRelationCode) {
    return false;
  }

  if (!relationName) {
    return true;
  }

  const marker = `"${relationName}"`;
  return chain.some(
    (item) => typeof item.message === "string" && item.message.includes(marker),
  );
}

export function getMissingRelationSetupMessage(
  error: unknown,
  relationName: string,
  resourceLabel: string,
) {
  if (!isMissingRelationError(error, relationName)) {
    return null;
  }

  return `${resourceLabel}数据表未初始化，请先执行 npm run db:migrate:sql。`;
}

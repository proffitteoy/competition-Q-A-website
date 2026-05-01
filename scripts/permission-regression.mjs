import assert from "node:assert/strict";

const {
  assertCanEditCompetitionContent,
  assertCanManageCompetitions,
  assertCanReviewApplications,
} = await import("../src/server/permissions/competition-permissions.ts");

function run(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("super_admin can review without scope", () => {
  assert.doesNotThrow(() => {
    assertCanReviewApplications({ role: "super_admin" }, undefined);
  });
});

run("competition_admin must provide competitionId", () => {
  assert.throws(() => {
    assertCanReviewApplications(
      {
        role: "competition_admin",
        scopedCompetitionIds: ["comp-1"],
      },
      undefined,
    );
  });
});

run("competition_admin can only review scoped competitions", () => {
  assert.doesNotThrow(() => {
    assertCanReviewApplications(
      {
        role: "competition_admin",
        scopedCompetitionIds: ["comp-1"],
      },
      "comp-1",
    );
  });

  assert.throws(() => {
    assertCanReviewApplications(
      {
        role: "competition_admin",
        scopedCompetitionIds: ["comp-1"],
      },
      "comp-2",
    );
  });
});

run("content_editor cannot review applications", () => {
  assert.throws(() => {
    assertCanReviewApplications(
      {
        role: "content_editor",
        scopedCompetitionIds: ["comp-1"],
      },
      "comp-1",
    );
  });
});

run("content_editor can edit only scoped content", () => {
  assert.doesNotThrow(() => {
    assertCanEditCompetitionContent(
      {
        role: "content_editor",
        scopedCompetitionIds: ["comp-1"],
      },
      "comp-1",
    );
  });

  assert.throws(() => {
    assertCanEditCompetitionContent(
      {
        role: "content_editor",
        scopedCompetitionIds: [],
      },
      "comp-1",
    );
  });
});

run("competition_admin cannot manage out-of-scope competitions", () => {
  assert.throws(() => {
    assertCanManageCompetitions(
      {
        role: "competition_admin",
        scopedCompetitionIds: [],
      },
      "comp-1",
    );
  });
});

console.log("Permission regression checks completed.");

export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[?(.*?)\]?:\s(.*)$/,
      headerCorrespondence: ["type", "subject"],
    },
  },
  rules: {
    "header-max-length": [2, "always", 100],
    "type-enum": [
      2,
      "always",
      [
        "fix",
        "feat",
        "style",
        "refactor",
        "chore",
        "perf",
        "test",
        "revert",
        "docs",
        "wip",
        "ci",
        "build",
      ],
    ],
    "type-case": [2, "always", "lowercase"],
    "subject-case": [2, "always", "lowercase"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
  },
};

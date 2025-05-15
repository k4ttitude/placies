import { defaults } from "ts-jest/presets";

const tsJestTransform = defaults.transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: { ...tsJestTransform },
};

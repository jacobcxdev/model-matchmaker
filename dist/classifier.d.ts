import { type Profile, type ClassifierResult } from "./types.ts";
export declare const OVERRIDE_PREFIX = "\\";
export declare function classify(prompt: string, profile: Profile): ClassifierResult;

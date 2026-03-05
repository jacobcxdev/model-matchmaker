export declare enum Tier {
    LOW = "LOW",
    STANDARD = "STANDARD",
    HIGH = "HIGH"
}
export type Profile = "quality" | "balanced" | "budget";
export interface ClassifierResult {
    readonly tier: Tier;
    readonly message: string | null;
}
export interface HookInput {
    readonly hook_event_name: string;
    readonly session_id?: string;
    readonly cwd?: string;
    readonly prompt?: string;
}
export interface LogEntry {
    readonly timestamp: string;
    readonly profile: Profile;
    readonly tier: Tier;
    readonly snippet: string;
}

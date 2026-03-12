export type AccuracyGrade = "perfect" | "good" | "late" | "early" | "miss";

export interface AccuracyEvent {
    time: number;
    pitch: number;
    grade: AccuracyGrade;
}

export interface PerformanceResult {
    songId: string;
    sectionId: string | null; // null means full song
    completedAt: number; // unix timestamp ms
    score: number; // 0-100
    accuracy: number; // 0-1
    events: AccuracyEvent[];
    finished: boolean;
}

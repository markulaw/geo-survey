import { calculateQuestionScore } from "./CalculateQuestionScore";

type AnyObject = Record<string, any>;

export type CredibilityQuestionStats = {
    questionId: string;
    answerType: string;
    timeSpentSorted: number[];
    medianTimeStampsSorted: number[];
    zoomLevelSorted: number[];
    zoomActionsSorted: number[];
    lineStringScoreSorted: number[];
};

export type CredibilityContext = {
    statsByQuestionId: Record<string, CredibilityQuestionStats>;
};

const toNumber = (value: any): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
};

const sortNumeric = (arr: number[]): number[] =>
    arr.filter(Number.isFinite).sort((a, b) => a - b);

const median = (arr: number[]): number => {
    if (!Array.isArray(arr) || arr.length === 0) return NaN;
    const values = arr.map(toNumber).filter(Number.isFinite).sort((a, b) => a - b);
    if (values.length === 0) return NaN;
    const mid = Math.floor(values.length / 2);
    return values.length % 2 === 0
        ? (values[mid - 1] + values[mid]) / 2
        : values[mid];
};

const maxValue = (arr: number[]): number => {
    if (!Array.isArray(arr) || arr.length === 0) return NaN;
    const values = arr.map(toNumber).filter(Number.isFinite);
    return values.length > 0 ? Math.max(...values) : NaN;
};

const msToSeconds = (value: number): number => {
    if (!Number.isFinite(value)) return NaN;
    return value > 1000 ? value / 1000 : value;
};

const getAnswerType = (question: any): string => {
    return (
        question?.answerType ||
        question?.answer?.geometry?.type ||
        question?.answer?.type ||
        ""
    );
};

const isMapQuestionType = (answerType: string): boolean =>
    ["Point", "Polygon", "LineString"].includes(answerType);

const isLineStringQuestion = (answerType: string): boolean =>
    answerType === "LineString";

const linearPercentilePenalty = (percentile: number): number => {
    if (!Number.isFinite(percentile)) return 100;
    if (percentile >= 20) return 100;
    return 20 + (percentile / 20) * 80;
};

const linearDecay20to60 = (seconds: number): number => {
    if (!Number.isFinite(seconds)) return 100;
    if (seconds <= 20) return 100;
    if (seconds >= 60) return 0;
    return ((60 - seconds) / 40) * 100;
};

const upperBound = (sorted: number[], value: number): number => {
    let lo = 0;
    let hi = sorted.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (sorted[mid] <= value) lo = mid + 1;
        else hi = mid;
    }
    return lo;
};

const percentileRank = (sorted: number[], value: number): number => {
    if (!sorted.length || !Number.isFinite(value)) return NaN;
    return (upperBound(sorted, value) / sorted.length) * 100;
};

const getQuestionById = (survey: any, questionId: string | number) =>
    survey?.questions?.find((q: any) => String(q.id) === String(questionId));

const calculateTotalQuestionScore = (answer: any, surveyQuestion: any): number => {
    const questionAnswer = surveyQuestion?.answer;
    if (!questionAnswer) return 0;

    if (
        Array.isArray(questionAnswer?.scoringCategories) &&
        questionAnswer.scoringCategories.length > 0
    ) {
        return questionAnswer.scoringCategories.reduce((sum: number, category: any) => {
            const maxScorePerQn = Number(category?.score ?? 0);
            const { score } = calculateQuestionScore({
                answer,
                questionAnswer,
                maxScorePerQn,
            });
            return sum + Number(score ?? 0);
        }, 0);
    }

    const { score } = calculateQuestionScore({
        answer,
        questionAnswer,
        maxScorePerQn: 1,
    });

    return Number(score ?? 0);
};

const getSegments = (coords: number[][]) => {
    const segments: Array<[[number, number], [number, number]]> = [];
    for (let i = 0; i < coords.length - 1; i++) {
        const a = coords[i];
        const b = coords[i + 1];
        if (
            Array.isArray(a) &&
            Array.isArray(b) &&
            a.length >= 2 &&
            b.length >= 2 &&
            Number.isFinite(Number(a[0])) &&
            Number.isFinite(Number(a[1])) &&
            Number.isFinite(Number(b[0])) &&
            Number.isFinite(Number(b[1]))
        ) {
            segments.push([
                [Number(a[0]), Number(a[1])],
                [Number(b[0]), Number(b[1])],
            ]);
        }
    }
    return segments;
};

const orientation = (
    p: [number, number],
    q: [number, number],
    r: [number, number]
): number => {
    const val =
        (q[1] - p[1]) * (r[0] - q[0]) -
        (q[0] - p[0]) * (r[1] - q[1]);

    if (Math.abs(val) < 1e-12) return 0;
    return val > 0 ? 1 : 2;
};

const onSegment = (
    p: [number, number],
    q: [number, number],
    r: [number, number]
): boolean => {
    return (
        q[0] <= Math.max(p[0], r[0]) &&
        q[0] >= Math.min(p[0], r[0]) &&
        q[1] <= Math.max(p[1], r[1]) &&
        q[1] >= Math.min(p[1], r[1])
    );
};

const segmentsIntersect = (
    seg1: [[number, number], [number, number]],
    seg2: [[number, number], [number, number]]
): boolean => {
    const [p1, q1] = seg1;
    const [p2, q2] = seg2;

    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) return true;

    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
};

const hasSelfIntersection = (answer: any): boolean => {
    const coords = answer?.geoJSON?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 4) return false;

    const segments = getSegments(coords);
    if (segments.length < 3) return false;

    for (let i = 0; i < segments.length; i++) {
        for (let j = i + 1; j < segments.length; j++) {
            if (Math.abs(i - j) <= 1) continue;
            if (segmentsIntersect(segments[i], segments[j])) {
                return true;
            }
        }
    }

    return false;
};

export const buildCredibilityContext = (
    answers: any[],
    survey: any
): CredibilityContext => {
    const buckets: Record<string, CredibilityQuestionStats> = {};

    (answers ?? []).forEach((respondent: any) => {
        (respondent?.answers ?? []).forEach((answer: any) => {
            const question = getQuestionById(survey, answer?.questionId);
            if (!question) return;

            const questionId = String(answer.questionId);
            const answerType = getAnswerType(question);

            if (!buckets[questionId]) {
                buckets[questionId] = {
                    questionId,
                    answerType,
                    timeSpentSorted: [],
                    medianTimeStampsSorted: [],
                    zoomLevelSorted: [],
                    zoomActionsSorted: [],
                    lineStringScoreSorted: [],
                };
            }

            const bucket = buckets[questionId];

            const timeSpent = toNumber(answer?.timeSpent);
            if (Number.isFinite(timeSpent)) bucket.timeSpentSorted.push(timeSpent);

            const timeStamps = Array.isArray(answer?.timeStamps) ? answer.timeStamps : [];
            if (timeStamps.length > 0) {
                const med = median(timeStamps);
                if (Number.isFinite(med)) bucket.medianTimeStampsSorted.push(med);
            }

            if (isMapQuestionType(answerType)) {
                const zoomLevel = toNumber(answer?.zoomLevel);
                if (Number.isFinite(zoomLevel)) bucket.zoomLevelSorted.push(zoomLevel);

                const zoomActions =
                    Number(answer?.zoomIns ?? 0) + Number(answer?.zoomOuts ?? 0);
                if (Number.isFinite(zoomActions)) bucket.zoomActionsSorted.push(zoomActions);
            }

            if (isLineStringQuestion(answerType)) {
                const score = calculateTotalQuestionScore(answer, question);
                if (Number.isFinite(score)) bucket.lineStringScoreSorted.push(score);
            }
        });
    });

    Object.values(buckets).forEach((bucket) => {
        bucket.timeSpentSorted = sortNumeric(bucket.timeSpentSorted);
        bucket.medianTimeStampsSorted = sortNumeric(bucket.medianTimeStampsSorted);
        bucket.zoomLevelSorted = sortNumeric(bucket.zoomLevelSorted);
        bucket.zoomActionsSorted = sortNumeric(bucket.zoomActionsSorted);
        bucket.lineStringScoreSorted = sortNumeric(bucket.lineStringScoreSorted);
    });

    return {
        statsByQuestionId: buckets,
    };
};

export const calculateCredibility = (
    answer: any,
    surveyQuestion: any,
    credibilityContext?: CredibilityContext
): number => {
    if (!answer || !surveyQuestion) return 100;

    const questionId = String(answer.questionId);
    const answerType = getAnswerType(surveyQuestion);
    const stats = credibilityContext?.statsByQuestionId?.[questionId];

    const metrics: number[] = [];
    const questionScore = calculateTotalQuestionScore(answer, surveyQuestion);

    // 1. timeSpent percentile, only if score === 0
    if (stats?.timeSpentSorted?.length && Number(questionScore) === 0) {
        const p = percentileRank(stats.timeSpentSorted, toNumber(answer?.timeSpent));
        metrics.push(linearPercentilePenalty(p));
    }

    // 2. mediana timeStamps percentile
    if (stats?.medianTimeStampsSorted?.length) {
        const med = median(Array.isArray(answer?.timeStamps) ? answer.timeStamps : []);
        if (Number.isFinite(med)) {
            const p = percentileRank(stats.medianTimeStampsSorted, med);
            metrics.push(linearPercentilePenalty(p));
        }
    }

    // 3. max(timeStamps)
    {
        const mx = maxValue(Array.isArray(answer?.timeStamps) ? answer.timeStamps : []);
        if (Number.isFinite(mx)) {
            metrics.push(linearDecay20to60(msToSeconds(mx)));
        }
    }

    // 4. max(inactivityPeriods)
    {
        const mx = maxValue(
            Array.isArray(answer?.inactivityPeriods) ? answer.inactivityPeriods : []
        );
        if (Number.isFinite(mx)) {
            metrics.push(linearDecay20to60(msToSeconds(mx)));
        }
    }

    // 5. attempts
    {
        const attempts = Number(answer?.attempts ?? 0);
        metrics.push(attempts > 3 ? 120 : 100);
    }

    // 6. zoomLevel percentile for map questions
    if (isMapQuestionType(answerType) && stats?.zoomLevelSorted?.length) {
        const zoomLevel = toNumber(answer?.zoomLevel);
        if (Number.isFinite(zoomLevel)) {
            const p = percentileRank(stats.zoomLevelSorted, zoomLevel);
            metrics.push(linearPercentilePenalty(p));
        }
    }

    // 7. zoomIns + zoomOuts percentile
    if (isMapQuestionType(answerType) && stats?.zoomActionsSorted?.length) {
        const zoomActions =
            Number(answer?.zoomIns ?? 0) + Number(answer?.zoomOuts ?? 0);
        const p = percentileRank(stats.zoomActionsSorted, zoomActions);
        metrics.push(p > 70 ? 120 : 100);
    }

    // 8. LineString points percentile
    if (isLineStringQuestion(answerType) && stats?.lineStringScoreSorted?.length) {
        const p = percentileRank(stats.lineStringScoreSorted, questionScore);
        metrics.push(linearPercentilePenalty(p));
    }

    // 9. timeOutsideTab
    {
        const seconds = msToSeconds(Number(answer?.timeOutsideTab ?? 0));
        metrics.push(seconds > 10 ? 20 : 100);
    }

    // 10. LineString self-intersection
    if (isLineStringQuestion(answerType)) {
        metrics.push(hasSelfIntersection(answer) ? 20 : 100);
    }

    if (metrics.length === 0) return 100;

    const credibility = metrics.reduce((acc, value) => acc * (value / 100), 100);
    return Math.round(credibility);
};
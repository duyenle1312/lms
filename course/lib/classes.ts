import { removeStopwords } from "stopword";

abstract class RecommendationSystem {
    course_weights: Record<string, number> = {}

    topCourses(): Record<string, number> {
        return this.course_weights
    }

    abstract calculate(): void;
}

export class RecommendationForUser extends RecommendationSystem {
    user_id: number;
    user_matrix: number[] = [];
    course_matrix: number[][] = [];

    constructor(user_id: number) {
        super()
        this.user_id = user_id
    }

    calculate(): void {
        console.log("RecommendationForUser")
    }
}

export class RecommendationForCourse extends RecommendationSystem {
    course_id: number;

    constructor(course_id: number) {
        super()
        this.course_id = course_id
    }

    tokenizer(text: string): string[] {
        let tokens = text
            .replace(/[^a-zA-Z ]/g, "")
            .toLowerCase()
            .split(" ");
        tokens = removeStopwords(tokens).filter(function (i: string) {
            return i != ""; // remove empty token
        });
        return tokens;

    }

    countWordFrequency (text: string): { [key: string]: number } {
        const frequency: { [key: string]: number } = {};
        const tokens = this.tokenizer(text);
        //console.log(tokens);
        tokens.forEach((i: string) => (frequency[i] = (frequency[i] || 0) + 1));
        //console.log(frequency);
        return frequency;
    };

    bagOfWords(
        tokens: string[],
        wordFreq: { [key: string]: number }
    ): number[] {
        const result: number[] = [];
        tokens.forEach((t) => result.push(wordFreq[t] || 0));
        return result;
    };

    cosineSimilarity (x: number[], y: number[]): number {
        if (x.length !== y.length) {
            console.log("Two vectors are not in the same length!");
            return 0;
        }

        let product = 0;
        let sum_x = 0;
        let sum_y = 0;
        for (let i = 0; i < x.length; i++) {
            product += x[i] * y[i];
            sum_x += x[i] ** 2;
            sum_y += y[i] ** 2;
        }
        const result = product / (Math.sqrt(sum_x) * Math.sqrt(sum_y));
        return result * 100;
    };

    calculate(): void {
        console.log("RecommendationForCourse")
    }
}


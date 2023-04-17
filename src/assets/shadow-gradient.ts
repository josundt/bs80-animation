import { LinearGradient } from "../lib/linear-gradient.js";

export class ShadowGradient extends LinearGradient {
    constructor() {
        super(
            [0.00, [26, 4, 48, 0.00]],
            [0.30, [26, 4, 48, 0.00]],
            [0.50, [7, 1, 10, 0.7]],
            [0.60, [4, 1, 5, 0.99]],
            [0.65, [1, 1, 1, 1.00]],
            [0.68, [4, 1, 7, 0.99]],
            [0.78, [11, 10, 17, 0.7]],
            [1.00, [41, 39, 62, 0.00]]
        );
    }
}

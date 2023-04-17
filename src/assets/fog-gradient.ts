import { LinearGradient } from "../lib/linear-gradient.js";

export class FogGradient extends LinearGradient {
    constructor() {
        super(
            [0.00, [26, 4, 48, 0]],
            [0.30, [0, 0, 0, 0]],
            [0.5, [0, 0, 0, 0.8]],
            [0.6, [0, 0, 0, 0.99]],
            [0.65, [0, 0, 0, 1]],
            [0.68, [0, 0, 0, 0.99]],
            [0.75, [0, 0, 0, 0.8]],
            [1.00, [41, 39, 62, 0]]
        );
    }
}

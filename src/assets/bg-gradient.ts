import { LinearGradient } from "../lib/linear-gradient.js";

export class BgGradient extends LinearGradient {
    constructor() {
        super(
            [0.00, [15, 3, 40, 1]],
            //[0.65, [26, 4, 48, 1]],
            [1.00, [31, 29, 52, 1]]
        );
    }
}

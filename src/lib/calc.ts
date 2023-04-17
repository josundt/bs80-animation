
export namespace Calc {

    export function avg(...numbers: number[]): number {
        return numbers.reduce((aggr, curr) => aggr + (curr / numbers.length), 0);
    }

}

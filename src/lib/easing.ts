export namespace Easing {
    export const easeIn = (k: number, exp: number = 1.67): number => k ** exp;

    export const easeOut = (k: number, exp: number = 1.67): number => 1 - (Math.max(1 - k, 0) ** exp);

    export const easeInOut = (k: number): number => .5*(Math.sin((k - .5)*Math.PI) + 1);
}

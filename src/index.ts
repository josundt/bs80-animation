import { Bs80Animation } from "./bs80-animation.js";


// Ensure live reload for TS/JS and hot reload for CSS works when debugging
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const IS_DEVELOPMENT: boolean | undefined;
if (IS_DEVELOPMENT) {
    import("./live-reload.js");
}


// Start animation
const bs80Animation = new Bs80Animation(
    document.body,
    () => [window.innerWidth, window.innerHeight]
);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bs80Animation.start();

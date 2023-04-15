export namespace CanvasRecorder {
    // Must be called before starting animation
    export function recordCanvasAsMovieFile(ctx: CanvasRenderingContext2D): void {
        const chunks: Blob[] = [];
        const stream = ctx.canvas.captureStream(200);
        const recorder = new MediaRecorder(stream, {
            mimeType: "video/webm; codecs=vp9",
            videoBitsPerSecond: 335544320
        });

        // Record data in chunks array when data is available
        recorder.ondataavailable = evt => chunks.push(evt.data);

        // Provide recorded data when recording stops
        recorder.onstop = () => {
            // Gather chunks of video data into a blob and create an object URL
            const blob = new Blob(chunks, { type: "video/webm; codecs=vp9" });
            const url = URL.createObjectURL(blob);
            // Attach the object URL to an <a> element, setting the download file name
            const a = document.createElement("a");
            //a.style = "display: none;";
            a.href = url;
            a.download = "perspective-grid.webm";
            // document.body.appendChild(a);
            // Trigger the file download
            a.click();
            setTimeout(() => {
                // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
                URL.revokeObjectURL(url);
                // document.body.removeChild(a);
            }, 0);
        };

        // Start recording using a 1s timeslice [ie data is made available every 1s)
        recorder.start(10);
    }
}

interface EsbuildChangeEventData {
    added: string[];
    removed: string[];
    updated: string[];
}

interface EsbuildChangeEvent {
    data: string;
}

new EventSource("/esbuild").addEventListener("change", (e: EsbuildChangeEvent) => {
    const { added, removed, updated } = JSON.parse(e.data) as EsbuildChangeEventData;

    if (!added.length && !removed.length && updated.length >= 1) {

        const cssUpdates = updated.filter(u => u.toLowerCase().endsWith(".css"));
        const links = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']"));
        for (const u of cssUpdates) {
            const currentLink = links.find(l => {
                const url = new URL(l.href);
                return url.origin === location.origin && url.pathname === u;
            });
            if (currentLink) {
                const newLink = currentLink.cloneNode() as HTMLLinkElement;
                newLink.href = `${updated[0]}?${Math.random().toString(36).slice(2)}`;
                newLink.onload = () => currentLink.remove();
                currentLink.parentNode!.insertBefore(newLink, currentLink.nextSibling);
                return;
            }
        }
    }
    location.reload();
});

/**
 * @name ProxyHttpPlugin
 * @version 1.0
 * @description Routes HTTP requests through free proxies for fetching external data.
 * @author MTF17
 */

module.exports = class ProxyHttpPlugin {
    constructor() {
        this.proxyList = [];
        this.currentProxyIndex = 0;
        this.proxyEnabled = false;
    }

    // Fetch proxy list from a reliable source
    async fetchProxyList() {
        try {
            const response = await fetch('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=1000&country=all&ssl=all&anonymity=elite');
            const proxyData = await response.text();
            this.proxyList = proxyData.split('\n').filter(proxy => proxy.trim() !== '');
            console.log(`[ProxyHttpPlugin] Fetched ${this.proxyList.length} proxies.`);
        } catch (error) {
            console.error('[ProxyHttpPlugin] Failed to fetch proxy list:', error);
        }
    }

    // Use the next proxy from the list
    getNextProxy() {
        if (this.proxyList.length === 0) {
            console.warn('[ProxyHttpPlugin] Proxy list is empty.');
            return null;
        }
        const proxy = this.proxyList[this.currentProxyIndex];
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyList.length;
        return proxy;
    }

    // Perform an HTTP request through a proxy
    async fetchDataThroughProxy(url) {
        const proxy = this.getNextProxy();
        if (!proxy) {
            console.error('[ProxyHttpPlugin] No proxy available for the request.');
            return null;
        }

        const proxyUrl = `http://${proxy}`;
        console.log(`[ProxyHttpPlugin] Using proxy: ${proxyUrl}`);

        try {
            const response = await fetch(url, {
                agent: new (require('http-proxy-agent'))(proxyUrl), // Requires 'http-proxy-agent' library
            });
            const data = await response.text();
            console.log(`[ProxyHttpPlugin] Fetched data from ${url} through proxy.`);
            return data;
        } catch (error) {
            console.error(`[ProxyHttpPlugin] Failed to fetch data through proxy: ${error.message}`);
            return null;
        }
    }

    // Load the plugin
    load() {
        console.log('[ProxyHttpPlugin] Plugin loaded.');
    }

    // Start the plugin
    async start() {
        console.log('[ProxyHttpPlugin] Plugin started.');
        await this.fetchProxyList();
    }

    // Stop the plugin
    stop() {
        console.log('[ProxyHttpPlugin] Plugin stopped.');
    }

    // Settings panel for toggling the proxy feature
    getSettingsPanel() {
        const panel = document.createElement('div');
        panel.style.padding = '10px';

        const toggleLabel = document.createElement('label');
        toggleLabel.innerText = 'Enable Proxy Fetching';
        toggleLabel.style.display = 'block';
        toggleLabel.style.marginBottom = '10px';

        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = this.proxyEnabled;
        toggleInput.addEventListener('change', () => {
            this.proxyEnabled = toggleInput.checked;
            console.log(`[ProxyHttpPlugin] Proxy fetching ${this.proxyEnabled ? 'enabled' : 'disabled'}.`);
        });

        panel.appendChild(toggleLabel);
        panel.appendChild(toggleInput);
        return panel;
    }
};

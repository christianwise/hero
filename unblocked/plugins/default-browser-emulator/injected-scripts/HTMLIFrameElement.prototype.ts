// This bypass is based on the one from puppeteer-stealth-evasions

const frameWindowProxies = new WeakMap();

proxyGetter(HTMLIFrameElement.prototype, 'contentWindow', (target, iframe) => {
  if (frameWindowProxies.has(iframe) && iframe.isConnected) {
    return frameWindowProxies.get(iframe);
  }
  return ProxyOverride.callOriginal;
});

proxySetter(HTMLIFrameElement.prototype, 'srcdoc', function (_, iframe) {
  if (!frameWindowProxies.has(iframe)) {
    const proxy = new Proxy(self, {
      get(target, key) {
        if (key === 'self' || key === 'contentWindow') {
          return iframe.contentWindow;
        }
        if (key === 'document') {
          return iframe.contentDocument || iframe.contentWindow.document;
        }
        // iframe.contentWindow.frameElement === iframe // must be true
        if (key === 'frameElement') {
          return iframe;
        }
        // Intercept iframe.contentWindow[0] to hide the property 0 added by the proxy.
        if (key === '0') {
          return undefined;
        }
        return ReflectCached.get(self, key);
      },
    });

    frameWindowProxies.set(iframe, proxy);
  }
  return ProxyOverride.callOriginal;
});

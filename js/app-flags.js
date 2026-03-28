function createDefaultFeatureFlags() {
    return {
        welcome: true,
        stats: true,
        level: true,
        practice: true,
        result: true,
        global: true
    };
}

function parseFeatureList(value) {
    if (!value || typeof value !== 'string') {
        return [];
    }
    return value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

function resolveFeatureFlagsFromQuery(defaultFlags, queryString) {
    const resolvedFlags = { ...defaultFlags };
    const params = new URLSearchParams(queryString || '');
    const enableList = parseFeatureList(params.get('enable'));
    const disableList = parseFeatureList(params.get('disable'));

    if (enableList.length > 0) {
        Object.keys(resolvedFlags).forEach((key) => {
            resolvedFlags[key] = false;
        });
        enableList.forEach((key) => {
            if (key in resolvedFlags) {
                resolvedFlags[key] = true;
            }
        });
    }

    disableList.forEach((key) => {
        if (key in resolvedFlags) {
            resolvedFlags[key] = false;
        }
    });

    return resolvedFlags;
}

function shouldShowFeatureFlagsDebug(queryString) {
    const params = new URLSearchParams(queryString || '');
    const debugValue = (params.get('debugFlags') || '').trim().toLowerCase();
    return debugValue === '1' || debugValue === 'true' || debugValue === 'yes';
}

function getFeatureFlagsSummary(flags) {
    const enabledKeys = [];
    const disabledKeys = [];
    Object.keys(flags || {}).forEach((key) => {
        if (flags[key]) {
            enabledKeys.push(key);
            return;
        }
        disabledKeys.push(key);
    });
    return { enabledKeys, disabledKeys };
}

function formatFeatureFlagsForCopy(flags) {
    const summary = getFeatureFlagsSummary(flags);
    return [
        `ON=${summary.enabledKeys.join(',') || '-'}`,
        `OFF=${summary.disabledKeys.join(',') || '-'}`
    ].join('\n');
}

function buildFeatureFlagsDebugUrl(flags, locationHref = '') {
    const safeHref = locationHref || (typeof window !== 'undefined' ? window.location.href : 'http://localhost/index.html');
    const url = new URL(safeHref, safeHref.startsWith('http') ? undefined : 'http://localhost');
    const summary = getFeatureFlagsSummary(flags);
    url.search = '';
    if (summary.enabledKeys.length > 0) {
        url.searchParams.set('enable', summary.enabledKeys.join(','));
    }
    if (summary.disabledKeys.length > 0) {
        url.searchParams.set('disable', summary.disabledKeys.join(','));
    }
    url.searchParams.set('debugFlags', '1');
    return url.toString();
}

function setFeatureFlagsPanelCollapsed(panel, collapsed) {
    if (!panel) {
        return;
    }
    panel.dataset.collapsed = collapsed ? '1' : '0';
    const content = panel.querySelector('[data-role="content"]');
    const toggleButton = panel.querySelector('[data-role="toggle"]');
    if (content) {
        content.style.display = collapsed ? 'none' : 'block';
    }
    if (toggleButton) {
        toggleButton.textContent = collapsed ? '展开' : '折叠';
    }
}

function copyTextWithFallback(text, doc = document, nav = navigator) {
    if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
        return nav.clipboard.writeText(text)
            .then(() => true)
            .catch(() => false);
    }
    try {
        const textArea = doc.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', 'readonly');
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        doc.body.appendChild(textArea);
        textArea.select();
        const copied = typeof doc.execCommand === 'function' && doc.execCommand('copy');
        doc.body.removeChild(textArea);
        return Promise.resolve(!!copied);
    } catch (error) {
        return Promise.resolve(false);
    }
}

function renderFeatureFlagsDebugPanel(flags, doc = document) {
    const panelId = 'feature-flags-debug-panel';
    const existingPanel = doc.getElementById(panelId);
    if (existingPanel) {
        existingPanel.remove();
    }
    const panel = doc.createElement('div');
    panel.id = panelId;
    panel.style.position = 'fixed';
    panel.style.right = '12px';
    panel.style.bottom = '12px';
    panel.style.zIndex = '9999';
    panel.style.padding = '10px 12px';
    panel.style.borderRadius = '10px';
    panel.style.background = 'rgba(0, 0, 0, 0.78)';
    panel.style.color = '#fff';
    panel.style.fontFamily = 'monospace';
    panel.style.fontSize = '12px';
    panel.style.lineHeight = '1.6';
    panel.style.maxWidth = '260px';
    panel.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.35)';
    const summary = getFeatureFlagsSummary(flags);
    const copyText = formatFeatureFlagsForCopy(flags);
    const debugUrl = buildFeatureFlagsDebugUrl(flags, doc?.location?.href || '');
    panel.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <div style="font-weight:700;">Feature Flags</div>
            <div style="display:flex; gap:6px;">
                <button data-role="copy" type="button" style="font-size:11px; padding:2px 6px; border:none; border-radius:6px; cursor:pointer;">复制</button>
                <button data-role="copy-url" type="button" style="font-size:11px; padding:2px 6px; border:none; border-radius:6px; cursor:pointer;">复制链接</button>
                <button data-role="toggle" type="button" style="font-size:11px; padding:2px 6px; border:none; border-radius:6px; cursor:pointer;">折叠</button>
            </div>
        </div>
        <div data-role="content" style="margin-top:6px;">
            <div>ON: ${summary.enabledKeys.join(', ') || '-'}</div>
            <div>OFF: ${summary.disabledKeys.join(', ') || '-'}</div>
        </div>
    `;
    doc.body.appendChild(panel);
    const copyButton = panel.querySelector('[data-role="copy"]');
    const copyUrlButton = panel.querySelector('[data-role="copy-url"]');
    const toggleButton = panel.querySelector('[data-role="toggle"]');
    copyButton?.addEventListener('click', async () => {
        const copied = await copyTextWithFallback(copyText, doc);
        copyButton.textContent = copied ? '已复制' : '失败';
        setTimeout(() => {
            copyButton.textContent = '复制';
        }, 1200);
    });
    copyUrlButton?.addEventListener('click', async () => {
        const copied = await copyTextWithFallback(debugUrl, doc);
        copyUrlButton.textContent = copied ? '已复制' : '失败';
        setTimeout(() => {
            copyUrlButton.textContent = '复制链接';
        }, 1200);
    });
    toggleButton?.addEventListener('click', () => {
        const collapsed = panel.dataset.collapsed === '1';
        setFeatureFlagsPanelCollapsed(panel, !collapsed);
    });
    setFeatureFlagsPanelCollapsed(panel, false);
}

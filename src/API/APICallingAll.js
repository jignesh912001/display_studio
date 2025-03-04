import axios from "axios";
import { nanoid } from "nanoid";

const url = 'https://back.disploy.com/api/';
const token = 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxMjUiLCJ1bmlxdWVfbmFtZSI6ImhldGFsLnByYWphcGF0aUB0aGVkZXN0aW55c29sdXRpb25zLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3N5c3RlbSI6IkluZGlhIFN0YW5kYXJkIFRpbWUiLCJuYmYiOjE3MzYyMjcwMjYsImV4cCI6MTczNjQ4NjIyNiwiaWF0IjoxNzM2MjI3MDI2fQ.1hm_bIk4Mc9haAWPIqf_CcOdWJrLp99JttSn_eiSDdC_HM08xKnvdU7rdHFFCnmHPiJEcqzzaPTPNxX1UgDOow';

const isSignedIn = () => {
    return window.puter?.auth?.isSignedIn();
};

const withTimeout = (fn, name) =>
    async (...args) => {
        const startTime = Date.now();
        const timeoutId = setTimeout(async () => {
            // Log timeout error with Sentry
            const error = new Error('API call timeout');
            try {
                const req = await fetch('https://api.puter.com/version');
                const version = await req.json();

                window.Sentry?.captureException(error, {
                    extra: {
                        function: name,
                        arguments: args,
                        elapsedTime: Date.now() - startTime,
                        user: await window.puter?.auth?.getUser(),
                        version,
                        size: JSON.stringify(args).length,
                    },
                });
            } catch (e) {
                window.Sentry?.captureException(
                    new Error('Failed to log error to Sentry: ' + e.message)
                );
            }
        }, 15000);

        try {
            const result = await fn(...args);
            clearTimeout(timeoutId);
            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    };

export async function getAssetsAction(item) {
    const response = await axios.get(`${url}AssetMaster/GetAssetDetails`, {
        params: { ScreenType: item.assetsType, searchAsset: '' },
        headers: { Authorization: token, "Content-Type": "multipart/form-data", },
    });
    return response
}


export async function saveAssetsAction(formData) {
    const response = await fetch(`${url}AssetMaster/AssetUpload`, { method: 'POST', body: formData, headers: { Authorization: token } });
    return response
}


export async function saveDesign({ storeJSON, preview, name, id }) {
    console.log('saving');
    if (!id) {
        id = nanoid(10);
    }

    const previewPath = `designs/${id}.jpg`;
    const storePath = `designs/${id}.json`;

    await writeFile(previewPath, preview);
    console.log('preview saved');
    await writeFile(storePath, JSON.stringify(storeJSON));
    let list = await listDesigns();
    const existing = list?.find((design) => design.id === id);
    if (existing) {
        existing.name = name;
    } else {
        list.push({ id, name });
    }

    await writeKv('designs-list', list);
    return { id, status: 'saved' };
}

const writeFile = withTimeout(async function writeFile(fileName, data) {
    if (isSignedIn()) {
        await window.puter.fs.write(fileName, data, { createMissingParents: true });
    } else {
        await localStorage.setItem(fileName, data);
    }
}, 'writeFile');

export async function listDesigns() {
    return (await readKv('designs-list')) || [];
}

const writeKv = withTimeout(async function writeKv(key, value) {
    if (isSignedIn()) {
        return await window.puter.kv.set(key, value);
    } else {
        return await localStorage.setItem(key, value);
    }
}, 'writeKv');

const readKv = withTimeout(async function readKv(key) {
    if (isSignedIn()) {
        return await window.puter.kv.get(key);
    } else {
        return await localStorage.getItem(key);
    }
}, 'readKv');

const readFile = withTimeout(async function readFile(fileName) {
    if (isSignedIn()) {
      return await window.puter.fs.read(fileName);
    }
    return await localStorage.getItem(fileName);
  }, 'readFile');

export const getPreview = async ({ id }) => {
    const preview = await readFile(`designs/${id}.jpg`);
    return URL.createObjectURL(preview);
  };


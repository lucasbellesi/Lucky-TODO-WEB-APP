// Fetch wrapper with baseURL, JSON, error handling
export async function fetchJson(
	url: string,
	options?: RequestInit & { timeout?: number }
): Promise<any> {
	const { timeout = 10000, ...fetchOpts } = options || {};
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);
	try {
		const res = await fetch(url, { ...fetchOpts, signal: controller.signal });
		const contentType = res.headers.get('content-type') || '';
		let data: any = null;
		if (contentType.includes('application/json')) {
			data = await res.json();
		} else {
			data = await res.text();
		}
		if (!res.ok) {
			throw { status: res.status, data };
		}
		return data;
	} catch (err) {
		if ((err as any).name === 'AbortError') {
			throw new Error('Request timed out');
		}
		throw err;
	} finally {
		clearTimeout(id);
	}
}

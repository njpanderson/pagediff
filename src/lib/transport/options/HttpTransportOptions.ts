import { JSDOM } from 'jsdom';
import TransportOptions from "@contracts/TransportOptions";

export default interface HttpTransportOptions extends TransportOptions {
	url: string;
	useCache?: boolean;
	cacheAs?: string;
	delayMs: number;
	forceCachedCopy?: boolean;
	paginator?(dom: JSDOM, lastFetchData?: object): string|null;
}

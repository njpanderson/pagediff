import { JSDOM } from 'jsdom';
//import { fetchUrl } from 'fetch';
import axios from 'axios';

import Transport from '@contracts/Transport';
import Cache from '@contracts/Cache';
import HttpTransportOptions from './options/HttpTransportOptions';
import cache from '@lib/cache';
import { sleep } from '@lib/utils';
import TransportResponse from '@contracts/TransportResponse';

export default class Http implements Transport {
	static defaultHeaders = {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Safari/605.1.15',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		'Accept-Encoding': 'gzip',
		'Accept-Language': 'en-GB,en;q=0.5',
		'Connection': 'keep-alive',
		'Upgrade-Insecure-Requests': '1',
		'Pragma': 'no-cache',
		'Cache-Control': 'no-cache'
	};

	private fetchCount = 0;

	/**
	 * Default options
	 */
	public options: HttpTransportOptions = {
		url: '',
		useCache: true,
		delayMs: 1000,
		forceCachedCopy: false
	};

	private cache: Cache;

	constructor(options?: HttpTransportOptions) {
		// Set options from page definition, using defaults
		this.options = {
			...this.options,
			...options
		};

		this.cache = cache('Transport_Http');
	}

	async fetch(lastDom: JSDOM, lastFetchData?: object): Promise<TransportResponse> {
		let url,
			delay: number = 0;

		if (this.fetchCount > 0 && this.options.paginator) {
			delay = this.getSleepDelay(this.options.delayMs);
			url = this.options.paginator(lastDom, lastFetchData);
		} else if (this.fetchCount === 0) {
			url = this.options.url;
		}

		this.fetchCount += 1;

		if (url) {
			return this.requestData(
				url,
				this.options.cacheAs ?? url,
				delay
			);
		}

		return Promise.resolve({
			data: null,
			page: this.fetchCount
		});
	}

	private getSleepDelay(delay: number|Function): number {
		if (typeof delay === 'function') {
			return <number> delay();
		}

		return delay;
	}

	private async requestData(
		url: string,
		cacheId: string = '',
		delay: number = 0
	): Promise<TransportResponse> {
		return new Promise(async (resolve, reject) => {
			let cached;

			if (cacheId === '')
				cacheId = url;

			if (
				this.options.useCache &&
				this.options.forceCachedCopy &&
				(cached = this.cache.getKey(cacheId))
			) {
				console.log(`Using forced cached copy for ${cacheId}...`);
				return resolve(cached);
			}

			if (delay) {
				console.log(`HTTP sleeping for ${delay / 1000}s`);
				await sleep(delay);
			}

			axios.get(url, {
				headers: this.getHeaders()
			}).then((response) => {
				const result = {
					data: response.data,
					page: this.fetchCount,
					lastFetchData: {
						headers: response.headers
					}
				};

				if (this.options.useCache)
					this.cache.setKey(cacheId, result);

				resolve(result);
			}).catch(reject);
		});
	}

	getHeaders(headers: object = {}) {
		return {
			...Http.defaultHeaders,
			...headers
		}
	}
}

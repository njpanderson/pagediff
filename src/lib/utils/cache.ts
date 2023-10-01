import * as flatCache from 'flat-cache';
import * as path from 'path';
import * as crypto from 'crypto';

import Cache from '@contracts/Cache';

export default (id: string) => {
	const cachePath = path.join(path.dirname(path.dirname(__dirname)), '.cache', id);
	const cache = flatCache.load(cachePath);

	return <Cache> {
		getKey(key: string): any {
			return cache.getKey(key);
		},

		setKey(...args: any) {
			cache.setKey.apply(cache, args);
			cache.save(true);

			return this;
		},

		getHash(key: string): string {
			return crypto.createHash('md5').update(key).digest('hex');
		}
	};
}

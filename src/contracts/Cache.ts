export default interface Cache {
	setKey(key: string, value: any): any;
	getKey(key: string): any;
	all(): object;
	removeKey(key: string): any;
	save(): any;
	getHash(key: string): string;
}

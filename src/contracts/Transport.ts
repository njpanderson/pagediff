import { JSDOM } from 'jsdom';
import TransportOptions from "./TransportOptions";
import TransportResponse from './TransportResponse';

export default interface Transport {
	fetch(lastDom: JSDOM|null, lastFetchData: object|undefined): Promise<TransportResponse>;
	options?: TransportOptions;
}

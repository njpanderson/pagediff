import Email from "@lib/reporters/Email";
import Console from "@lib/reporters/Console";
import Reporter from "./Reporter";

export default interface ReporterOptions {
	[index: string]: Reporter|undefined,
	email?: Email,
	console?: Console
};

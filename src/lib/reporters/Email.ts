import { readFile } from 'node:fs/promises';
import * as path from 'path';
import { createTransport } from 'nodemailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as Handlebars from 'handlebars';

import Base from 'base/Reporter';
import Reporter from "@contracts/Reporter";
import PageDefinition from '@contracts/PageDefinition';
import Selector from '@contracts/Selector';
import Diff from '@lib/models/Diff';

interface EmailSMTPOptions {
	host: string,
	ssl?: boolean,
	requireTLS?: boolean,
	port?: number,
	user: string,
	pass?: string
}

interface EmailOptions {
	smtp?: EmailSMTPOptions,
	to: string,
	from: string
};

export default class Email extends Base implements Reporter {
	declare protected options: EmailOptions;

	constructor(options?: EmailOptions) {
		super();

		if (!options || !options.to || !options.from)
			throw new Error('If using Email, a from and to address must be specified.');

		if (options.smtp && !options.smtp.host)
			throw new Error('If using Email, an SMTP host must be specified.');

		this.options = {
			smtp: {
				host: '',
				ssl: false,
				requireTLS: false,
				port: 587,
				user: '',
				pass: '',
				...options?.smtp
			},
			...options
		};
	}

	async report(page: PageDefinition, selector: Selector, diff: Diff): Promise<any> {
		const transporter = this.getTransporter();

		if (diff.count) {
			const changes = diff.getData(page.diff?.context).map((part) => {
				let lineTokens: Array<object> = [{
					value: part.value
				}];

				if (part.value && selector.highlights) {
					lineTokens = this.setHighlights(part.value, selector.highlights);
				}

				return {
					type: part.added ? '+' : (part.removed ? '-' : ' '),
					typeClass: part.added ? 'add' : (part.removed ? 'remove' : ''),
					line: lineTokens
				};
			});

			const templateData = await readFile(
				path.join(__dirname, '..', '..', 'templates', 'email.hbs')
			);

			let template = Handlebars.compile(templateData.toString());

			const html = template({
				numChanges: diff.count,
				pageLink: page.link ?? null,
				pageTitle: page.title,
				selectorTitle: selector.title,
				changes
			});

			const subject = `PageDiff - ${diff.count} change(s) detected in ${
				page.title
			} / ${selector.title}`;

			// Send the email
			transporter.sendMail({
				to: this.options.to,
				from: this.options.from,
				subject,
				html
			});
		}
	}

	error(error: Error): void {
		console.error(error);
	}

	private setHighlights(line: string, highlights: Array<string>): Array<object> {
		const match = new RegExp(`(${highlights.join('|')})`, 'ig');

		return line.split(
			match
		).map((token) => {
			if (token.match(match)) {
				return {
					highlight: true,
					value: token
				};
			}

			return { value: token };
		});
	}

	private getTransporter() {
		return createTransport(<SMTPTransport.Options> {
			host: this.options.smtp?.host,
			port: this.options.smtp?.port,
			secure: this.options.smtp?.ssl,
			requireTLS: this.options.smtp?.requireTLS,
			auth: {
				user: this.options.smtp?.user,
				pass: this.options.smtp?.pass
			}
		});
	}
}

# PageDiff

Just a personal project of mine — PageDiff will scan a folder of `.ts` files for a set of Page Definitions, which will be used to detect delta changes in a URL at various specified points, reporting in the manner required. It currently supports direct to console and SMTP.

Each time the script runs it will parse and collect data from a page according to the selectors and collector functions, then compare that data snapshot with whatever has been cached previously. If there are changes, then the defined reporter will run. How often you run this script is up to you, but you should be aware of things like bot detection and prevention on sites as well as generally playing nicely with servers!

This script is intended to run straight via a TypeScript runtime such as `ts-node` and therefore does not (yet) have any sort of compilation process. If you wanted to add one, I'm sure it would be fairly straight forward.

## Example Page Definition

```
// These imports assume the definition sits within the project's root
// (and thusly makes use of the defined paths), but in theory could live
// anywhere you like.
import PageDefinition from '@lib/models/PageDefinition';
import Email from '@lib/reporters/Email';

// New definition
export default new PageDefinition({
	title: 'My Page',
	link: 'https://www.example.com/somepage',
	transport: {
		type: 'Http',
		options: {
			url: 'https://www.example.com/some/data/page'
		},
	},
	diff: {
		// Show 3 lines either side of diffs
		context: 3
	},
	selectors: [{
		// CSS selector will return all matching HTMLElements
		selector: 'article.news-item',
		title: 'News Items',
		// Collector function is passed each matching element and
		// the Collector instance. It should return a plain object
		collector: (element, collector) => ({
			title: collector.textFrom(element, '.news-item--heading'),
			date: collector.textFrom(element, '.news-item--date')
		})
	}],
	reporters: {
		// Options for the email reporter
		// (required, as not a lot can be guessed)
		email: new Email({
			smtp: {
				host: 'smtp.host.domain',
				ssl: false,
				requireTLS: true,
				port: 587,
				user: 'email@server.com',
				pass: '...'
			},
			to: 'recipient@server.com',
			from: 'email@server.com'
		})
	}
});
```

Example run commands

```
 // Run with the default reporter (cli)
 $ ts-node src/index.ts --in ./pages

 // Run help
 $ ts-node src/index.ts -h
```

import { Change } from "diff";

export default class Diff {
	private _diff: Array<Change>;
	private _count: number = 0;

	constructor(diff: Array<Change>) {
		this._diff = diff;

		this._count = this.countDiffs(diff);
	}

	get data() {
		return this._diff;
	}

	get count() {
		return this._count;
	}

	getData(context: number = 3) {
		return this._diff.map((change, index) => {
			const changed = this.changeHasChanged(change);

			if (context < 1 && !changed) {
				return {
					...change,
					value: null
				};
			}

			const prev = (index > 0) ? this._diff.slice(index - 1, index)[0] : undefined;
			const prevChanged = this.changeHasChanged(prev);
			const next = (index < this._diff.length) ? this._diff.slice(index + 1, index + 2)[0] : undefined;
			const nextChanged = this.changeHasChanged(next);

			let newValue;

			if (!changed && change.value) {
				// This hunk hasn't changed - split and reduce it depending on previous/next change
				const hunkValue = change.value.split('\n');

				if (context < (hunkValue.length / 2)) {
					newValue = '';

					if (prevChanged)
						newValue += hunkValue.slice(0, context).join('\n');

					if (newValue !== '' && nextChanged) newValue += '\n...\n';

					if (nextChanged)
						newValue += hunkValue.slice(-(context + 1)).join('\n');
				} else {
					newValue = change.value;
				}
			} else {
				newValue = change.value;
			}

			return <Change> {
				...change,
				value: newValue
			};
		}).filter((change: any) => (!!change.value))
	}

	private changeHasChanged(change: Change|undefined) {
		if (change === undefined) return false;
		return (change.added !== undefined || change.removed !== undefined);
	}

	/**
	 * Count the number of changes in a diff. Will group additions with removals.
	 * @param diff
	 * @returns
	 */
	private countDiffs(diff: Array<Change>) {
		let previousType: string|null, count = 0;

		diff.forEach((change) => {
			const type: string|null = (change.added ? 'add' : (
				change.removed ? 'remove' : null
			));

			switch (type) {
			case 'add':
				if (previousType !== 'remove' || !previousType)
					count += 1;
				break;

			case 'remove':
				count += 1;
				break;
			}

			previousType = type;
		});

		return count;
	}
}

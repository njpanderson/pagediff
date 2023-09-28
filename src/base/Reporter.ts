export default abstract class BaseReporter {
	protected options = {};

	setOptions(options: object) {
		this.options = {
			...this.options,
			...options
		};
	}
}

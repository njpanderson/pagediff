export default {
	/**
	 * Generate a random number between the two boundaries (inclusive).
	 * @param {number} [min = 0]
	 * @param {number} [max = 1]
	 * @returns {number}
	 */
	random: (min: number = 0, max: number = 1): number => {
		return Math.round(Math.random() * (max - min)) + min;
	}
}

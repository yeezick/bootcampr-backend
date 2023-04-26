
/**
 * Generate a Random Index
 * @param {Number} length of array you need a random Index for
 * @returns {Number} index to access random element of an array
 * 
 */
export const randomIndex = (length) => Math.floor(Math.random() * length);

/**
 * Select a random subsection of an array
 *  - Use case was to select random tools from array of project tools - not needed now?
 * @param {Number} length of Array you'll be slicing
 * @returns 2 Element array with starting and ending index for random slice
 */
export const randomArraySlice = (length) => {
    const startingIndex = Math.floor((Math.random() * length) / 2);
    const endingIndex = Math.floor(Math.random() * length + startingIndex);
    return [startingIndex, endingIndex];
};

/**
 * Fisher-Yates Shuffle
 * @param {Array} array 
 * @returns same array with element order shuffled
 */
export const scrambleArrayOrder = (array) => {
    let currentIndex = array.length,
        randIndex;
    
        while (currentIndex != 0) {
        randIndex = randomIndex(currentIndex);
        currentIndex--;
        [array[currentIndex], array[randIndex]] = [array[randIndex], array[currentIndex]];
    }
    return array;
};
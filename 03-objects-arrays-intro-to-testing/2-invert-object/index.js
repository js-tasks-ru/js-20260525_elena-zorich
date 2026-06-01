/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns the new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
    if (!obj) {
        return undefined;
    }
    const inverted = {};
    Object.entries(obj).forEach(([key, value]) => {
        inverted[value] = key;
    });
    return inverted;
}

export function invertObj2(obj) {
    if (!obj) {
        return undefined;
    }
    const inverted = Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]));
    return inverted;
}

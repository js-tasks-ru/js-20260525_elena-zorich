/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if (size === undefined) {
        return string;
    }
    const arr = string.split('');
    let count = 1;
    let result = '';
    let lastSymbol = '';
    for (const symbol of arr) {
        if (symbol === lastSymbol) {
            count++;
        } else {
            count = 1;
            lastSymbol = symbol;
        }
        if (count <= size) {
            result += symbol;
        }
    }
    return result;

}

function trimSymbols2(string, size) {
    if (size === undefined) {
        return string;
    }
    const arr = string.split('');

    return arr.reduce((acc, symbol) => {
        const count = symbol === acc.lastSymbol ? acc.count +1 : 1;
        return {
            lastSymbol: symbol,
            count,
            result: count <= size ? acc.result + symbol : acc.result
        }
    }, { result: '', lastSymbol: '', count: 0 }).result;
}
export const abbrNum = (value, digits, large = null) => {
    try {
        if (value == undefined) {
            return 0
        }

        if (!parseFloat(value)) return 0

        if (large) {
            return Math.round(value)
                .toLocaleString()
                .replaceAll(',', ' ')
                .replaceAll('.', ' ')
        }

        const x = Math.floor(Math.log10(value) / 3)
        const a = x >= 1 ? value / 1000 ** x : value
        const sbl = ['', 'K', 'M', 'B', 'T', 'Q'][Math.max(x, 0)]
        return (Number.isInteger(a) ? a : a.toFixed(Math.max(digits - a.toFixed(0).length, 0))) + (sbl ? sbl : '')
    } catch (e) {
        return 0
    }
}

export const formatNumber = (number, max = 5, maxMax = 5) => {
    try {
        const num = parseFloat(number)

        if (num <= 0) return num

        if (parseInt(num) > 0) return parseFloat(num).toFixed(2)
        if (parseFloat((num + '').slice(0, 4)) > 0) return parseFloat((num + '').slice(0, 4)).toFixed(2)

        for (let i = 2; i < max; i++) {
            const test = abbrNum(num, i)

            if ((test + '').split('').reverse()[0] == 0 && parseFloat(test)) {
                return abbrNum(num, i - 1)
            }
        }

        if (parseFloat(abbrNum(num, maxMax))) {
            return abbrNum(num, maxMax)
        } else {
            return num
        }
    } catch (e) {
        console.log('err.get.corr.num:', e)
        return abbrNum(num, 10)
    }
}

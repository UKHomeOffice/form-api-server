// @ts-ignore
import formioUtils from 'formiojs/utils';

export const util = {
    ...formioUtils,
    isBoolean(value: any) {
        if (typeof value === 'boolean') {
            return true;
        } else if (typeof value === 'string') {
            value = value.toLowerCase();
            return (value === 'true') || (value === 'false');
        }
        return false;
    },

    /**
     * Quick boolean coercer.
     * @param value
     * @return {boolean}
     */
    boolean(value: any) {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            return (value.toLowerCase() === 'true');
        }
        return !!value;
    },
};

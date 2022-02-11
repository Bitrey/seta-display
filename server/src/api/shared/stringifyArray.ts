// Format array one line
const isPrimitive = (obj: any) =>
    obj === null || ["string", "number", "boolean"].includes(typeof obj);

const isArrayOfPrimitive = (obj: any) =>
    Array.isArray(obj) && obj.every(isPrimitive);

const format = (arr: any[]) =>
    `^^^[ ${arr.map(val => JSON.stringify(val)).join(", ")} ]`;

const replacer = (key: string, value: any) =>
    isArrayOfPrimitive(value) ? format(value) : value;

const expand = (str: string) =>
    str.replace(/(?:"\^\^\^)(\[ .* \])(?:\")/g, (match, a) =>
        a.replace(/\\"/g, '"')
    );

export const stringifyArray = (obj: any) =>
    expand(JSON.stringify(obj, replacer, 2));

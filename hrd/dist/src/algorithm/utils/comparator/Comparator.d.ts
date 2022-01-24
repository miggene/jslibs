export default class Comparator {
    private compare;
    constructor(compare?: Function);
    static defaultCompareFunction(a: string | number, b: string | number): 0 | 1 | -1;
    equal(a: any, b: any): boolean;
    lessThan(a: any, b: any): boolean;
    greaterThan(a: any, b: any): boolean;
    lessThanOrEqual(a: any, b: any): boolean;
    greaterThanOrEqual(a: any, b: any): boolean;
    reverse(): void;
}

import {DiscountComponent} from "../../../Components/DiscountComponent";
import {Product} from "../../../../Product";

export function xor(a: boolean, b: boolean) {
    return !!a !== !!b;
}

export class XorDiscounts implements DiscountComponent{
    private discounts: DiscountComponent[];
    private _id: number;


    constructor(id: number, discounts: DiscountComponent[]) {
        this. _id = id;
        this.discounts= discounts;
    }

    get id(): number {
        return this._id;
    }

    calculateProductsPrice(products: [Product, number, number][]): [Product, number, number][] {
        let discCallBack = (acc:[Product, number, number][], dcCurr: DiscountComponent)=> dcCurr.calculateProductsPrice(acc);
            return this.discounts.reduce(discCallBack,products);
    }


    addDiscountElement(toAdd: DiscountComponent){
        this.discounts.push(toAdd);
    }
    removeDiscountElement(toRemove: DiscountComponent){
        let i = this.discounts.indexOf(toRemove);
        this.discounts.splice(i, 1);
    }

    predicate(products: [Product, number, number][]): boolean {
        let predCallbak = (acc:boolean, dc:DiscountComponent) =>  xor(acc, dc.predicate(products));
        return this.discounts.reduce(predCallbak, true);
    }
}
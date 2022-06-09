import {Product} from "./Product";
import {DiscountRelation, ProductCategory, ShopRate, ShopStatus} from "../../utilities/Enums";
import {ShoppingBag} from "../user/ShoppingBag";
import {DiscountComponent} from "./DiscountAndPurchasePolicies/Components/DiscountComponent";
import {
    ImmediatePurchasePolicyComponent
} from "./DiscountAndPurchasePolicies/Components/ImmediatePurchasePolicyComponent";
import {Answer} from "../../utilities/Types";
import {Guest} from "../user/Guest";
import {
    ConditionalDiscountData,
    ContainerDiscountData,
    DiscountData,
    SimpleDiscountData
} from "../../utilities/DataObjects";
import {SimpleDiscount} from "./DiscountAndPurchasePolicies/leaves/SimpleDiscount";
import {PredicateDiscountPolicy} from "./DiscountAndPurchasePolicies/Predicates/PredicateDiscountPolicy";
import {ConditionalDiscount} from "./DiscountAndPurchasePolicies/leaves/ConditionalDiscount";
import {
    AndDiscounts
} from "./DiscountAndPurchasePolicies/Containers/DiscountsContainers/LogicCompositions/AndDiscounts";
import {OrDiscounts} from "./DiscountAndPurchasePolicies/Containers/DiscountsContainers/LogicCompositions/OrDiscounts";
import {
    XorDiscounts
} from "./DiscountAndPurchasePolicies/Containers/DiscountsContainers/LogicCompositions/XorDiscounts";
import {
    AdditionDiscounts
} from "./DiscountAndPurchasePolicies/Containers/DiscountsContainers/NumericConditions/AdditionDiscounts";
import {
    MaxDiscounts
} from "./DiscountAndPurchasePolicies/Containers/DiscountsContainers/NumericConditions/MaxDiscounts";


export class Shop {

    private _id: number;
    private _name: string;
    private _status: ShopStatus;
    private _shopFounder: string;
    private _shopOwners: Set<string>;
    private _shopManagers: Set<string>;
    private _products: Map<number, [Product, number]>;
    private _productsCounter: number;
    private _rate: ShopRate;
    private _discounts: Map<number, DiscountComponent>;
    private _discountCounter: number;
    private _purchasePolicies: Map <number, ImmediatePurchasePolicyComponent>;
    private _purchaseCounter: number;
    private _description?: string;

    constructor(id: number, name: string, shopFounder: string, description?: string){
        this._id= id;
        this._name= name;
        this._status= ShopStatus.open;
        this._shopFounder= shopFounder;
        this._shopOwners= new Set<string>([shopFounder]);
        this._shopManagers= new Set<string>();
        this._products= new Map<number, [Product, number]>();
        this._productsCounter = 0;
        this._rate= ShopRate.NotRated;
        this._discounts= new Map<number, DiscountComponent>();
        this._discountCounter= 0;
        this._purchasePolicies = new Map <number, ImmediatePurchasePolicyComponent>();
        this._purchaseCounter = 0;
        this._description = description;
    }


    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get status(): ShopStatus {
        return this._status;
    }

    set status(value: ShopStatus) {
        this._status = value;
    }

    get shopFounder(): string {
        return this._shopFounder;
    }

    get description(): string {
        return this._description;
    }

    set shopFounder(value: string) {
        this._shopFounder = value;
    }

    get shopOwners(): Set<string> {
        return this._shopOwners;
    }

    set shopOwners(value: Set<string>) {
        this._shopOwners = value;
    }

    get shopManagers(): Set<string> {
        return this._shopManagers;
    }

    set shopManagers(value: Set<string>) {
        this._shopManagers = value;
    }

    get products(): Map<number, [Product, number]> {
        return this._products;
    }

    set products(value: Map<number, [Product, number]>) {
        this._products = value;
    }

    get productsCounter(): number {
        return this._productsCounter;
    }
    set productsCounter(value: number) {
        this._productsCounter = value;
    }

    get rate(): ShopRate {
        return this._rate;
    }

    set rate(value: ShopRate) {
        this._rate = value;
    }

    set description(value: string) {
        this._description = value;
    }

    get discounts(): Map<number, DiscountComponent> {
        return this._discounts;
    }

    get discountCounter(): number {
        return this._discountCounter;
    }
    set discountCounter(value: number) {
        this._discountCounter = value;
    }

    get purchasePolicies(): Map<number, ImmediatePurchasePolicyComponent> {
        return this._purchasePolicies;
    }

    get purchaseCounter(): number {
        this._purchaseCounter++;
        return this._purchaseCounter--;
    }
    set purchaseCounter(value: number) {
        this._purchaseCounter = value;
    }

    addProduct(productName: string, category: ProductCategory, fullPrice: number,quantity: number, productDesc?: string ): Product{
        let toAdd= new Product(productName, this.id, this._productsCounter, category, fullPrice, productDesc);
        if(!this.products.has(toAdd.id)){
            this.products.set(toAdd.id, [toAdd, quantity]);
            return toAdd;
        }
        this._productsCounter++;
        return toAdd;
    }

    getProductQuantity(productId: number): number{
        let product= this.products.get(productId);
        if(!product)
            throw new Error ("Failed to return product quantity in shop because the product map of the shop is undefined");
        return product[1];
    }

    //Delete a product from the store catalog
    removeProduct(productId: number): void{
        if(!this.products.delete(productId))
            throw new Error(`Failed to remove product, because product id: ${productId} was not found`);
    }

    updateProductQuantity(productId: number, quantity: number): void{
        let product = this.products.get(productId);
        if(!product)
            throw new Error("Failed to update product quantity in shop because the product isn't exist in shop")
        if(quantity < 0)
            quantity= 0;
        this.products.set(productId, [product[0],quantity]);
    }

    getProduct(productId: number): Product{
        if(!this.products)
            throw new Error("Failed to search product in shop because the product map of the shop is undefined");
        let toReturnPair= this.products.get(productId);
        if(toReturnPair)
            return toReturnPair[0];
        throw new Error(`Product with id: ${productId} was not found.`);
    }

    appointShopOwner(ownerId: string): void{
        if(this.shopOwners?.has(ownerId))
            throw new Error("Failed to appoint owner because the member is already a owner of the shop")
        this.shopOwners?.add(ownerId);
    }

    appointShopManager(managerId: string): void{
        if(this.shopManagers?.has(managerId))
            throw new Error("Failed to appoint owner because the member is already a owner of the shop")
        this.shopManagers?.add(managerId);
    }

    calculateBagPrice(bag: ShoppingBag): [Product, number, number][]{

        let productsList = this.extractProducts(bag.products);
        let productsInfo: [Product, number, number][] = [];
        for(let [p, quantity] of bag.products.values()){
            productsInfo.push([p, p.fullPrice, quantity]);
        }
        if(this._discounts.size>0){
            for( let disc of this._discounts.values()){
                if(disc.predicate(productsInfo))
                    productsInfo = disc.calculateProductsPrice(productsInfo);
            }
        }

        return productsInfo;
    }

    canMakePurchase(purchaseInfo:[ bag: ShoppingBag, user: Guest]): Answer {
        let policies = Array.from(this._purchasePolicies.values());
        let callBack = (acc: Answer, currPolicy: ImmediatePurchasePolicyComponent): Answer => {
                            let ans = currPolicy.CanMakePurchase(purchaseInfo);
                            return acc = {ok: acc.ok && ans.ok, message: acc.message + '\n' + ans.message}
                        };
        return policies.reduce(callBack, {ok:true, message:"Couldn't make purchase because:"});
    }

    private extractProducts(shopProducts: Map<number, [Product, number]>): Product[]{
        let productsList = [];
        for(let tuple of shopProducts){ productsList.push(tuple[1][0])}
        return productsList;
    }

    addDiscount(disc: DiscountData): DiscountComponent{
        let toAdd:DiscountComponent;
        if (disc instanceof SimpleDiscountData){
            let discInf = {type: disc.discountType, object: disc.object}
            toAdd = new SimpleDiscount(this._discountCounter,discInf, disc.discountPrecent);
        }
        else if (disc instanceof ConditionalDiscountData){
            let discInf = {type: disc.discount.discountType, object: disc.discount.object}
            let discount = new SimpleDiscount(this._discountCounter,discInf, disc.discount.discountPrecent);
            let pred = new PredicateDiscountPolicy(disc.predTypeObject, disc.predObject, disc.predRelation, disc.predValue);
            toAdd = new ConditionalDiscount(this._discountCounter,discount, pred);
        }
       else if (disc instanceof ContainerDiscountData) {
           let callBack = (curr: DiscountData)=> this.addDiscount(curr);
           let discComponents = disc.discounts.map(callBack);
            switch (disc.discountRelation){
                case DiscountRelation.And:
                    toAdd = new AndDiscounts(this.discountCounter, discComponents);
                case DiscountRelation.Or:
                    toAdd = new OrDiscounts(this.discountCounter,discComponents);
                case DiscountRelation.Xor:
                    toAdd= new XorDiscounts(this.discountCounter,discComponents);
                case DiscountRelation.Addition:
                    toAdd = new AdditionDiscounts(this.discountCounter,discComponents);
                case DiscountRelation.Max:
                    toAdd = new MaxDiscounts(this.discountCounter,discComponents);
            }
        }
        this._discounts.set(this._discountCounter,toAdd);
        this._discountCounter++;
        return toAdd;
    }

    removeDiscount(idDisc: number): void{
        this._discounts.delete(idDisc);
    }

    addPurchasePolicy(puPolicy: ImmediatePurchasePolicyComponent): number{
        this._purchasePolicies.set(this._purchaseCounter,puPolicy);
        this._purchaseCounter++;
        return this._purchaseCounter-1;
    }

    removePurchasePolicy(idPuPolicy: number){
        this._purchasePolicies.delete(idPuPolicy);
    }

}
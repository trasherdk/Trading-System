import { Result } from "../../utilities/Result";
import { DeliveryServiceAdaptor } from "../external_services/DeliveryServiceAdaptor";
import { PaymentServiceAdaptor } from "../external_services/PaymentServiceAdaptor";
import { ShoppingBag } from "../marketplace/ShoppingBag";
import {IMessagePublisher, IMessageListener} from "../notifications/IEventPublishers";
import { ShopPurchaseMessage } from "../notifications/Message";
import { Guest } from "../user/Guest";
import { Member } from "../user/Member";
import { User } from "../user/User";
import { BuyerOrder } from "./BuyerOrder";
import { ShopOrder } from "./ShopOrder";


export class PurchaseController implements IMessagePublisher<ShopPurchaseMessage> {
    private _subscriber: IMessageListener<ShopPurchaseMessage> | null;
    private _paymentService: PaymentServiceAdaptor;
    private _deliveryService: DeliveryServiceAdaptor;
    private buyerOrderCounter: number = 0;
    private shopOrderCounter: number = 0;
    private _buyerOrders: Map<string | number, Set<BuyerOrder>>;
    private _shopOrders: Map<number, Set<ShopOrder>>;
    
    
    constructor(paymentService: PaymentServiceAdaptor, deliveryService: DeliveryServiceAdaptor) {
        this._subscriber = null;
        this._buyerOrders = new Map<string | number, Set<BuyerOrder>>();
        this._shopOrders = new Map<number, Set<ShopOrder>>();
        this._paymentService = paymentService;
        this._deliveryService = deliveryService;
    }
    
    public get subscriber(): IMessageListener<ShopPurchaseMessage> | null {
        return this._subscriber;
    }
    public set subscriber(value: IMessageListener<ShopPurchaseMessage> | null) {
        this._subscriber = value;
    }
    public get paymentService(): PaymentServiceAdaptor {
        return this._paymentService;
    }
    public set paymentService(value: PaymentServiceAdaptor) {
        this._paymentService = value;
    }
    public get deliveryService(): DeliveryServiceAdaptor {
        return this._deliveryService;
    }
    public set deliveryService(value: DeliveryServiceAdaptor) {
        this._deliveryService = value;
    }
    public get buyerOrders(): Map<string | number, Set<BuyerOrder>> {
        return this._buyerOrders;
    }
    public get shopOrders(): Map<number, Set<ShopOrder>> {
        return this._shopOrders;
    }
    subscribe(sub: IMessageListener<ShopPurchaseMessage>) {
        this.subscriber = sub;
    }
    unsub(sub: IMessageListener<ShopPurchaseMessage>) {
        this.subscriber = null;
    }
    notify(message: ShopPurchaseMessage) {
        if(this.subscriber !== null)
            this.accept(this.subscriber, message);
        else
            throw new Error("No one to get the message");

    }
    accept(v: IMessageListener<ShopPurchaseMessage>, msg:ShopPurchaseMessage) {
        v.visitPurchaseEvent(msg)
    }

    setPaymentService(paymentService: PaymentServiceAdaptor){
        this.paymentService = paymentService;
    }

    setDeliveryService(deliveryService: DeliveryServiceAdaptor){
        this.deliveryService = deliveryService;
    }

    getPaymentService(){
        return this.paymentService;
    }

    getDeliveryService(){
        return this.deliveryService;
    }

    checkout(user: User): Result<void>{
        let shoppingCart = user._shoppingCart;
        let totalCartPrice = 0;
        let shopOrders = shoppingCart.bags.map((bag: ShoppingBag) => {
            totalCartPrice += bag.totalPrice;
            let shopOrder =  new ShopOrder(this.shopOrderCounter, bag.shopId, bag.products, bag.totalPrice, this.getCurrTime());
            if (this.shopOrders.has(bag.shopId)){
                let orders = this.shopOrders.get(bag.shopId);
                orders?.add(shopOrder);
            }
            else{
                let order = new Set<ShopOrder>();
                order.add(shopOrder);
                this.shopOrders.set(bag.shopId, order);
            }
        });
        // this.paymentService.makePayment(totalCartPrice);
        // this.deliveryService.makeDelivery("details");
        if (user instanceof Member){
            let buyerOrder = new BuyerOrder(this.buyerOrderCounter,user.username, shopOrders, totalCartPrice, this.getCurrTime());
            if (this.buyerOrders.has(user.username)){
                let orders = this.buyerOrders.get(user.username);
                if(orders){
                    orders?.add(buyerOrder);
                    this.buyerOrders.set(user.username, orders);
                }
            }
            else{
                let orders = new Set<BuyerOrder>();
                orders.add(buyerOrder);
                this.buyerOrders.set(user.username, orders);
            }

        }
        if (user instanceof Guest){
            let buyerOrder = new BuyerOrder(this.buyerOrderCounter,user.id, shopOrders, totalCartPrice, this.getCurrTime());
            if (this.buyerOrders.has(user.id)){
                let orders = this.buyerOrders.get(user.id);
                if(orders){
                    orders?.add(buyerOrder);
                    this.buyerOrders.set(user.id, orders);
                }
            }
            else{
                let orders = new Set<BuyerOrder>();
                orders.add(buyerOrder);
                this.buyerOrders.set(user.id, orders);
            }
        }
        return new Result(true, undefined);
    }
    getCurrTime(): string{
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        return dateTime;
    }
}
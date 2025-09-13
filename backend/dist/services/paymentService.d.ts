export interface PaymentPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    popular?: boolean;
}
export declare const userPlans: PaymentPlan[];
export declare const apiPlans: PaymentPlan[];
export declare const paymentPlans: PaymentPlan[];
export declare const paymentService: {
    createOrder(planId: string, userId: string, userEmail: string, userName?: string): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
    verifyPayment(paymentId: string, orderId: string, signature: string): Promise<{
        verified: boolean;
    }>;
    createSubscription(planId: string, userId: string, userEmail: string, userName?: string): Promise<import("razorpay/dist/types/subscriptions").Subscriptions.RazorpaySubscription>;
    getSubscription(subscriptionId: string): Promise<import("razorpay/dist/types/subscriptions").Subscriptions.RazorpaySubscription>;
    cancelSubscription(subscriptionId: string): Promise<import("razorpay/dist/types/subscriptions").Subscriptions.RazorpaySubscription>;
    getCustomerSubscriptions(customerId: string): Promise<{
        entity: string;
        count: number;
        items: Array<import("razorpay/dist/types/subscriptions").Subscriptions.RazorpaySubscription>;
    }>;
    createCustomer(email: string, name?: string): Promise<import("razorpay/dist/types/customers").Customers.RazorpayCustomer>;
    getPayment(paymentId: string): Promise<import("razorpay/dist/types/payments").Payments.RazorpayPayment>;
    getPlans(): Promise<PaymentPlan[]>;
    getPlan(planId: string): Promise<PaymentPlan | null>;
};
//# sourceMappingURL=paymentService.d.ts.map
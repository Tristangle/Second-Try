import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();
console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);
export class StripeService {
  private stripe: Stripe;
    
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });
  }

  // Créer une Checkout Session
  async createCheckoutSession(
    amount: number,
    currency: string,
    successUrl: string,
    cancelUrl: string,
    customerEmail: string
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Reservation Payment',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    });
  }

  // Récupérer une Checkout Session par ID
  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  // Créer un client Stripe
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  // Récupérer un client Stripe par ID
  async retrieveCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    return this.stripe.customers.retrieve(customerId);
  }

  // Ajouter une méthode de paiement à un client
  async attachPaymentMethodToCustomer(customerId: string, paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  }

  // Gérer d'autres opérations Stripe (comme les abonnements, les remboursements, etc.)
  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
    });
  }

  // Rembourser un paiement
  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  }
}

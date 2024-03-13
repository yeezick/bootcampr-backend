import baseStripe from 'stripe';
const stripe = baseStripe(process.env.STRIPE_TOKEN);
const singleProjectPriceId = process.env.STRIPE_PROJECT_PRICE_ID;
const bootcamprDomain = process.env.BASE_URL;

export const createCheckout = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: singleProjectPriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${bootcamprDomain}/whats-next`,
      cancel_url: `${bootcamprDomain}/checkout`, // TODO: speak with Dan on this error state, maybe it's when too many users have paid?
    });
    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.log(error.message);
    // TODO: will need to be circle back to this as this is only for limited projects
    // Most likely won't be needed once teams are matched on a rolling basi
    if (error.message.includes('is not available to be purchased because its product is not active.')) {
      res.status(500).json({ error: error.message, checkoutUrl: `${bootcamprDomain}/payment/max-users` });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

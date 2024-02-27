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
      success_url: `${bootcamprDomain}/checkout`,
      cancel_url: `${bootcamprDomain}/checkout`,
    });
    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

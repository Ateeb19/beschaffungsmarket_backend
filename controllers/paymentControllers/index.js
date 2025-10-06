const Stripe = require("stripe");

const User = require("../../models/User");
const Invoice = require("../../models/Invoice");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const { downloadInvoice } = require("../../utils/uploadFile");

const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_SECRET_ENDPOINT
      );
    } catch (err) {
      console.log(`Webhook signature verification failed:`, err.message);
      return res.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
      case "invoice.created":
        const session = event.data.object;

        let currentDate = new Date();
        let updatedUserData = {};

        let isUser = await User.findOne({ email: session.customer_email });

        if (!isUser) {
          console.log("User not found.");

          return res
            .status(400)
            .json({ status: false, msg: "User not found." });
        }

        const paidAmount = session.amount_paid / 100;

        updatedUserData.is_premium =
          paidAmount === 179 || paidAmount === 1999 ? 1 : 2;

        updatedUserData.expired_time =
          paidAmount > 1000
            ? currentDate.setFullYear(currentDate.getFullYear() + 1)
            : currentDate.setMonth(currentDate.getMonth() + 1);

        await User.findOneAndUpdate(
          { _id: isUser._id },
          { $set: updatedUserData },
          { new: true }
        );

        const invoiceName = await downloadInvoice(session.invoice_pdf);

        const newInvoiceData = {
          user: isUser._id,
          amount: paidAmount,
          file: invoiceName,
        };

        await Invoice.create(newInvoiceData);

        // return res.redirect(`http://localhost:5173/`);
        break;
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

module.exports = {
  stripeWebhook,
};

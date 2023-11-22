import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import * as crypto from "crypto";
import Razorpay from "razorpay";
import cors from "cors";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT || 9090;

app.get("/", (req, res) => {
  res.send({ Hello: "Hii" });
});

const razorpayClient = new Razorpay({
  key_id: process.env.razorpay_key_id || "",
  key_secret: process.env.razorpay_key_secret || "",
});

app.post("/pay", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "The amount field is required." });
    }

    const razorpayOrderData = await new Promise((resolve, reject) => {
      const options = {
        amount: amount * 100,
        currency: currency,
        receipt: process.env.razorpay_receipt_email || "",
        payment_capture: 1,
        notes: {},
      };

      razorpayClient.orders.create(options, (err, razorpayOrder) => {
        if (err) {
          console.error("Error creating Razorpay order:", err);
          reject(err);
        } else {
          console.log("orderData:", razorpayOrder);
          resolve(razorpayOrder);
        }
      });
    });

    return res.status(200).json(razorpayOrderData);
  } catch (err) {
    console.error("Error in payment:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/verifyPay", async (req, res) => {
  try {
    const { paymentId, signature, orderId } = req.body;
    console.log("BODY: ", req.body);
    const sigGenerated = crypto
      .createHmac("sha256", process.env.razorpay_key_secret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    console.log("Signature: ", sigGenerated);

    if (sigGenerated === signature) {
      const payment = await razorpayClient.payments.fetch(paymentId);
      const capturedPayment = await razorpayClient.payments.capture(
        paymentId,
        payment.amount,
        payment.currency
      );
      console.log("capturedPayment: ", capturedPayment);
    }
    res.send.status(200).json("Payment successful!!");
  } catch (err) {
    return res.status(500).json({ err });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

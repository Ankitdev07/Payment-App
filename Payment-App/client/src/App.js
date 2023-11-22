import React, { useState } from "react";

const displayRazorpay = async ({ orderId, amount }) => {
  const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

  if (!res) {
    alert("Razropay failed to load!!");
    return;
  }

  const options = {
    key: "rzp_test_p9OX8i2miLdkqV", // Enter the Key ID generated from the Dashboard
    amount: amount?.dueAmount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Clubble Link Commerce",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: orderId,
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
    // handler: validatePayment,
  };
  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};

const loadScript = async (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

function App() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handlePayment = (paymentType) => {
    const apiUrl = "http://localhost:8080/pay";
    const requestData = {
      amount: Number(amount),
      currency,
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setResponseMessage(`Payment successful: ${paymentType}`);
        // console.log(data.id);
        displayRazorpay({ orderId: data.id, amount: data.amount*100 });
      })
      .catch((error) => {
        setResponseMessage(
          `Error processing ${paymentType} payment: ${error.message}`
        );
        console.error(error);
      });
  };

  return (
    <div>
      <h2>Payment Form</h2>

      <form>
        <label htmlFor="amount">Enter Amount:</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={amount}
          onChange={handleAmountChange}
          required
        />

        <br />

        <label htmlFor="currency">Select Currency:</label>
        <select
          id="currency"
          name="currency"
          value={currency}
          onChange={handleCurrencyChange}
          required
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </select>

        <br />

        <button type="button" onClick={() => handlePayment("Test")}>
          Test Payment
        </button>
        <button type="button" onClick={() => handlePayment("Live")}>
          Live Payment
        </button>

        {responseMessage && <p>{responseMessage}</p>}
      </form>
    </div>
  );
}

export default App;

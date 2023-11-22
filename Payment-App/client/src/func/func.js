export const loadScript = async (src) => {
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

displayRazorpay(data.data);

export const displayRazorpay = async ({ orderId, amount }) => {
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
    handler: validatePayment,
  };
  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};

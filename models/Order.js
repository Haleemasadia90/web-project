const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    formData: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      apartment: String,
      city: String,
      postalCode: String,
      country: String,
      shippingMethod: String,
      paymentMethod: String,
      billingSame: Boolean,
      billingFirstName: String,
      billingLastName: String,
      billingAddress: String,
      billingApartment: String,
      billingCity: String,
      billingPostalCode: String,
    },

    cartItems: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        size: String,
        image: String,
      },
    ],

    totalPrice: Number,
    shippingCost: Number,
    tax: Number,
    discount: Number,

    orderStatus: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

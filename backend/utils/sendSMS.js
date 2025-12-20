// utils/smsService.js

export const sendSMS = async (mobileNumber, message) => {
  try {
    console.log("📩 Sending SMS...",mobileNumber,message);
    if (!mobileNumber || !message) {
      throw new Error("Mobile number or message missing");
    }

    const params = new URLSearchParams({
      username: "techsms",
      message: message,
      sendername: "CLPLSE",
      smstype: "TRANS",
      numbers: mobileNumber,
      apikey: "8a8651c3-cc8e-40cd-a0d6-e841d35e1708",
      peid: "1701161605309086220",
      templateid: "1707176620785520348",
    });

    const smsUrl = `http://sms.bulksmsind.in/v2/sendSMS?${params.toString()}`;

    const response = await fetch(smsUrl, {
      method: "GET",
    });

    const text = await response.text();

    console.log("📩 SMS API RESPONSE:", text);

    if (!response.ok) {
      throw new Error("SMS API failed");
    }

    return true;
  } catch (err) {
    console.error("❌ SMS SEND ERROR:", err.message);
    return false;
  }
};
// export const sendSMS = async (mobileNumber, message) => {
//   try {
//     console.log("📩 Sending SMS...", mobileNumber, message);

//     if (!mobileNumber || !message) {
//       throw new Error("Mobile number or message missing");
//     }

//     // Ensure India format
//     const formattedNumber = mobileNumber.startsWith("91")
//       ? mobileNumber
//       : `91${mobileNumber}`;

//     // IMPORTANT: encode only the message
//     const encodedMessage = encodeURIComponent(message);

//     const smsUrl =
//       `http://sms.bulksmsind.in/v2/sendSMS` +
//       `?username=techsms` +
//       `&message=${encodedMessage}` +
//       `&sendername=CLPLSE` +
//       `&smstype=TRANS` +
//       `&numbers=${formattedNumber}` +
//       `&apikey=8a8651c3-cc8e-40cd-a0d6-e841d35e1708` +
//       `&peid=1701161605309086220` +
//       `&templateid=1707176620785520348`;

//     const response = await fetch(smsUrl, {
//       method: "GET",
//     });

//     const text = await response.text();
//     console.log("📩 SMS API RESPONSE:", text);

//     if (!response.ok) {
//       throw new Error("SMS API failed");
//     }

//     return true;
//   } catch (err) {
//     console.error("❌ SMS SEND ERROR:", err.message);
//     return false;
//   }
// };

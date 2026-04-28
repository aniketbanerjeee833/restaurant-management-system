// utils/smsService.js

// export const sendSMS = async (mobileNumber, message) => {
//   try {
//     console.log("📩 Sending SMS...",mobileNumber,message);
//     if (!mobileNumber || !message) {
//       throw new Error("Mobile number or message missing");
//     }

//     const params = new URLSearchParams({
//       username: "techsms",
//       message: message,
//       sendername: "CLPLSE",
//       smstype: "TRANS",
//       numbers: mobileNumber,
//       apikey: "8a8651c3-cc8e-40cd-a0d6-e841d35e1708",
//       peid: "1701161605309086220",
//       templateid: "1707176620785520348",
//     });

//     const smsUrl = `http://sms.bulksmsind.in/v2/sendSMS?${params.toString()}`;

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

// import axios from "axios";

// export const sendSMS = async (mobileNumber, message) => {
//   try {
//     console.log("📩 Sending SMS...", mobileNumber, message);

//     if (!mobileNumber || !message) {
//       throw new Error("Mobile number or message missing");
//     }

//     const params = new URLSearchParams({
//       username: "techsms",
//       message,
//       sendername: "CLPLSE",
//       smstype: "TRANS",
//       numbers: mobileNumber,
//       apikey: "8a8651c3-cc8e-40cd-a0d6-e841d35e1708",
//       peid: "1701161605309086220",
//       templateid: "1707176620785520348",
//     });

//     const smsUrl = `https://sms.bulksmsind.in/v2/sendSMS?${params.toString()}`;

//     const response = await axios.get(smsUrl, {
//       timeout: 15000,
//     });

//     console.log("📩 SMS API RESPONSE:", response.data);
//   return (
//       typeof res.data === "string" &&
//       res.data.toLowerCase().includes("success")
//     );

//   } catch (err) {
//     console.error(
//       "❌ SMS SEND ERROR:",
//       err.response?.data || err.message
//     );
//     return false;
//   }
// };
import axios from "axios";

// export const sendSMS = async (mobileNumber, message) => {
//   try {
//     console.log("📩 Sending SMS...", mobileNumber, message);

//     if (!mobileNumber || !message) {
//       throw new Error("Mobile number or message missing");
//     }

//     // ✅ BulkSMSIndia requires plain 10-digit number
//     const cleanNumber = mobileNumber.replace(/\D/g, "");

//     const params = new URLSearchParams({
//       username: "techsms",
//       message: message,
//       sendername: "CLPLSE",
//       smstype: "TRANS",
//       numbers: cleanNumber,
//       apikey: "8a8651c3-cc8e-40cd-a0d6-e841d35e1708",
//       peid: "1701161605309086220",
//       templateid: "1707176620785520348",
//     });

//     const smsUrl = `https://sms.bulksmsind.in/v2/sendSMS?${params.toString()}`;

//     // 🔥 THIS IS THE VARIABLE NAME
//     // const response = await axios.get(smsUrl, {
//     //   timeout: 15000,
//     // });
//     console.log("🚀 SMS URL:", smsUrl);

// const response = await axios.get(smsUrl, { timeout: 15000 });

// console.log("📩 SMS RAW RESPONSE TYPE:", typeof response.data);
// console.log("📩 SMS RAW RESPONSE:", response.data);

//     // ✅ LOG EXACT RESPONSE
//     // console.log("📩 SMS API RESPONSE:", response.data);

//     // BulkSMSIndia usually returns string
//     if (
//       typeof response.data === "string" &&
//       response.data.toLowerCase().includes("success")
//     ) {
//       return true;
//     }

//     return false;

//   } catch (err) {
//     console.error(
//       "❌ SMS SEND ERROR:",
//       err.response?.data || err.message
//     );
//     return false;
//   }
// };

// export const sendSMS = async (mobileNumber, message) => {
//   try {
//     console.log("📩 Sending SMS...", mobileNumber, message);

//     if (!mobileNumber || !message) {
//       throw new Error("Mobile number or message missing");
//     }

//     const cleanNumber = mobileNumber.replace(/\D/g, "");

//     const params = new URLSearchParams({
//       username: "HloGuy",
//       message: message.trim(),
//       sendername: "HLOGUY",
//       smstype: "TRANS",
//       numbers: cleanNumber,
//       apikey: "9a6ef775-4edc-424b-9850-8fdf58aab4d2",
//       peid: "1701176664403334670",
//       templateid: "1707176741897103615",
//     });

//     // 🔥 IMPORTANT: HTTPS
//     const smsUrl = `http://sms.bulksmsind.in/v2/sendSMS?${params.toString()}`;

//     console.log("🚀 SMS URL:", smsUrl);

//     const response = await axios.get(smsUrl, {
//       timeout: 15000,
//       headers: {
//         "User-Agent": "Mozilla/5.0",
//         "Accept": "*/*",
//       },
//     });

//     console.log("📩 SMS RESPONSE:", response.data);

//     if (
//       typeof response.data === "string" &&
//       response.data.toLowerCase().includes("submitted")
//     ) {
//       console.warn("⚠ SMS submitted (delivery depends on gateway)");
//       return true;
//     }

//     return false;

//   } catch (err) {
//     console.error("❌ SMS SEND ERROR:", err.response?.data || err.message);
//     return false;
//   }
// };
// export const sendSMS = async (mobileNumber, message) => {
//   try {
//     console.log("📩 Sending SMS...", mobileNumber, message);

//     if (!mobileNumber || !message) {
//       throw new Error("Mobile number or message missing");
//     }

// // Hi, Your bill from Hello Guys Shakuntala Park : Total Rs.{#var#} (incl. Tax). Bill No. {#var#} View full details: {#var#}. HloGuy
// // ✅ Clean mobile number
//     const cleanNumber = mobileNumber.replace(/\D/g, "");

//     // ⚠ IMPORTANT: encode message only
//     const encodedMessage = encodeURIComponent(message.trim());

//     // ✅ Build URL exactly like gateway expects
//     const smsUrl =
//       `http://sms.bulksmsind.in/v2/sendSMS` +
//       `?username=HloGuy` +
//       `&message=${encodedMessage}` +
//       `&sendername=HLOGUY` +
//       `&smstype=TRANS` +
//       `&numbers=${cleanNumber}` +
//       `&apikey=9a6ef775-4edc-424b-9850-8fdf58aab4d2` +
//       `&peid=1701176664403334670` +
//       `&templateid=1707176741897103615`;

//     console.log("🚀 SMS URL:", smsUrl);

//     const response = await axios.get(smsUrl, {
//       timeout: 15000,
//       headers: {
//         "User-Agent": "Mozilla/5.0",
//         "Accept": "*/*",
//       },
//     });

//     console.log("📩 SMS RESPONSE:", response.data);

//     if (
//       typeof response.data === "string" &&
//       response.data.toLowerCase().includes("submitted")
//     ) {
//       console.warn("⚠ SMS submitted (delivery depends on gateway)");
//       return true;
//     }

//     return false;

//   } catch (err) {
//     console.error("❌ SMS SEND ERROR:", err.response?.data || err.message);
//     return false;
//   }
// };
// export const sendSMS = async (mobileNumber, message) => {
//   try {
//     console.log("📩 Sending SMS...", mobileNumber, message);

//     if (!mobileNumber || !message) {
//       throw new Error("Mobile number or message missing");
//     }

//     // ✅ BulkSMSIndia requires plain 10-digit number
//     const cleanNumber = mobileNumber.replace(/\D/g, "");

//     const params = new URLSearchParams({
//       username: "techsms",
//       message: message,
//       sendername: "CLPLSE",
//       smstype: "TRANS",
//       numbers: cleanNumber,
//       apikey: "8a8651c3-cc8e-40cd-a0d6-e841d35e1708",
//       peid: "1701161605309086220",
//       templateid: "1707176620785520348",
//     });

//     const smsUrl = `https://sms.bulksmsind.in/v2/sendSMS?${params.toString()}`;

//     // 🔥 THIS IS THE VARIABLE NAME
//     // const response = await axios.get(smsUrl, {
//     //   timeout: 15000,
//     // });
//     console.log("🚀 SMS URL:", smsUrl);

// const response = await axios.get(smsUrl, { timeout: 15000 });

// console.log("📩 SMS RAW RESPONSE TYPE:", typeof response.data);
// console.log("📩 SMS RAW RESPONSE:", response.data);

//     // ✅ LOG EXACT RESPONSE
//     // console.log("📩 SMS API RESPONSE:", response.data);

//     // BulkSMSIndia usually returns string
//     if (
//       typeof response.data === "string" &&
//       response.data.toLowerCase().includes("success")
//     ) {
//       return true;
//     }

//     return false;

//   } catch (err) {
//     console.error(
//       "❌ SMS SEND ERROR:",
//       err.response?.data || err.message
//     );
//     return false;
//   }
// };
// };

export const sendSMS = async (mobileNumber, message) => {
  try {
    console.log("📩 Sending SMS...", mobileNumber, message);

    if (!mobileNumber || !message) {
      throw new Error("Mobile number or message missing");
    }

    // ✅ Clean mobile number
    const cleanNumber = mobileNumber.replace(/\D/g, "");

    // ⚠ IMPORTANT: encode message only
    const encodedMessage = encodeURIComponent(message.trim());
const smsUrl = `https://sms.bulksmsind.in/v2/sendSMS?username=${encodeURIComponent("HloGuy ")}&message=${encodedMessage}&sendername=HLOGUY&smstype=TRANS&numbers=${cleanNumber}&apikey=9a6ef775-4edc-424b-9850-8fdf58aab4d2&peid=1701176664403334670&templateid=1707176741897103615`;

//const smsUrl = `http://sms.bulksmsind.in/v2/sendSMS?username=HloGuy&message=${encodedMessage}&sendername=HLOGUY&smstype=TRANS&numbers=${cleanNumber}&apikey=9a6ef775-4edc-424b-9850-8fdf58aab4d2&peid=1701176664403334670&templateid=1707176741897103615`;

    // ✅ Build URL exactly like gateway expects
    // const smsUrl =
    //   `http://sms.bulksmsind.in:443/v2/sendSMS` +
    //   `?username=HloGuy` +
    //   `&message=${encodedMessage}` +
    //   `&sendername=HLOGUY` +
    //   `&smstype=TRANS` +
    //   `&numbers=${cleanNumber}` +
    //   `&apikey=9a6ef775-4edc-424b-9850-8fdf58aab4d2` +
    //   `&peid=1701176664403334670` +
    //   `&templateid=1707176741897103615`;

    console.log("🚀 SMS URL:", smsUrl);

    const response = await axios.get(smsUrl, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
      },
    });

    console.log("📩 SMS RESPONSE:", response.data);

    if (
      typeof response.data === "string" &&
      response.data.toLowerCase().includes("submitted")
    ) {
      console.warn("⚠ SMS submitted (delivery depends on gateway)");
      return true;
    }

    return false;

  } catch (err) {
    console.error("❌ SMS SEND ERROR:", err.response?.data || err.message);
    return false;
  }
};
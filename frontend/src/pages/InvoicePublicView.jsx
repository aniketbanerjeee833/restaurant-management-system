// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// export default function InvoicePublicView() {
//   const { token } = useParams();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       try {
//         const res = await axios.get(
//           `${"http://localhost:4000"}/public/invoice/${token}`
//         );

//         if (!res.data?.success) {
//           setError("Invoice not found");
//           return;
//         }

//         setInvoice(res.data.data);
//       } catch (err) {
//         setError("Unable to load invoice");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInvoice();
//   }, [token]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600">
//         Loading invoice...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-500">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
//       <div className="bg-white w-full max-w-md rounded-lg shadow-md p-4">
        
//         {/* Header */}
//         <h2 className="text-xl font-bold text-center mb-1">
//           Hello Guys Shakuntala Park
//         </h2>
//         <p className="text-center text-sm text-gray-500 mb-4">
//           Invoice / Bill
//         </p>

//         {/* Meta */}
//         <div className="text-sm mb-4">
//           <p><b>Invoice No:</b> {invoice.Invoice_Id}</p>
//           <p><b>Date:</b> {new Date(invoice.Invoice_Date).toLocaleString()}</p>
//           <p>
//             <b>Customer:</b>{" "}
//             {invoice.Customer_Name || "Walk-in Customer"}
//           </p>
//           <p><b>Phone:</b> {invoice.Customer_Phone}</p>
//         </div>

//         {/* Items */}
//         <div className="border-t border-b py-2 mb-3">
//           {invoice.Items.map((item, i) => (
//             <div key={i} className="flex justify-between text-sm mb-1">
//               <span>
//                 {item.Item_Name} × {item.Quantity}
//               </span>
//               <span>₹ {item.Amount.toFixed(2)}</span>
//             </div>
//           ))}
//         </div>

//         {/* Totals */}
//         <div className="text-sm">
//           <div className="flex justify-between">
//             <span>Sub Total</span>
//             <span>₹ {invoice.Sub_Total.toFixed(2)}</span>
//           </div>

//           <div className="flex justify-between">
//             <span>Discount</span>
//             <span>- ₹ {invoice.Discount.toFixed(2)}</span>
//           </div>

//           <div className="flex justify-between">
//             <span>Service Charge</span>
//             <span>₹ {invoice.Service_Charge.toFixed(2)}</span>
//           </div>

//           <div className="flex justify-between font-bold text-lg border-t mt-2 pt-2">
//             <span>Total</span>
//             <span>₹ {invoice.Amount.toFixed(2)}</span>
//           </div>
//         </div>

//         {/* Footer */}
//         <p className="text-center text-xs text-gray-500 mt-4">
//           Thank you for dining with us 🙏
//         </p>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function InvoicePublicView() {
  const { token } = useParams();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoiceHtml = async () => {
      try {
        const res = await axios.get(
          `${"http://localhost:4000/api/staff/order"}/public/invoice/${token}`,
          {
            responseType: "text", // 🔴 IMPORTANT
          }
        );

        setHtml(res.data); // ← RAW HTML
      } catch (err) {
        setError("Unable to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceHtml();
  }, [token]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        Loading invoice...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>
        {error}
      </div>
    );
  }

  // 🔥 Render EXACT HTML
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

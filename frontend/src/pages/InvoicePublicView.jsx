


// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";


// import { useNextInvoiceNumberQuery } from "../redux/api/Staff/orderApi";

// export default function InvoicePublicView() {
//   const { Invoice_Id } = useParams();

//   const [invoice, setInvoice] = useState(null);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
// const{data:invoiceNumberData}=useNextInvoiceNumberQuery();
//   useEffect(() => {
//     const fetchInvoice = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:4000/api/staff/order/${Invoice_Id}`
//         );

//         // EXPECTED BACKEND RESPONSE:
//         // { invoice: {...}, items: [...] }

//         setInvoice(res.data.invoice);
//         setItems(res.data.items);
//       } catch (err) {
//         setError("Unable to load invoice");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInvoice();
//   }, [Invoice_Id]);

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", marginTop: "2rem" }}>
//         Loading invoice...
//       </div>
//     );
//   }
  
//   if (error || !invoice) {
//     return (
//       <div style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>
//         {error || "invoice not found"}
//       </div>
//     );
//   }
// const html = ` 
// <!DOCTYPE html>
// <html>
//   <head>
//     <title>invoice - ${Invoice_Id}</title>
//     <meta charset="UTF-8">
    
//     <style>
//       * {
//         margin: 0;
//         padding: 0;
//         box-sizing: border-box;
//       }
      
//       body { 
//         font-family: 'Courier New', Courier, monospace;
//         font-size: 11px;
//         line-height: 1.3;
//         color: #000;
//         width: 2.5in;
//         margin: 0 auto;
//         padding: 0;
//       }
      
//       .invoice {
//         width: 2.5in;
//         padding: 8px;
//       }

//       .header-center { 
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//       align-items: center;
//         text-align: center; 
//         margin-bottom: 8px;
//         border-bottom: 1px dashed #000;
//         padding-bottom: 8px;
//       }
      
         
//           .logo { 
//             width: 60px; 
//             height: auto; 
//             margin-bottom: 4px;
//             padding: 5px;
//             background-color: black;
//           }
//       .brand { 
//         font-size: 16px; 
//         font-weight: bold; 
//         text-transform: uppercase;
//         letter-spacing: 1px;
//         margin-bottom: 2px;
//       }
      
//       .line { 
//         border-top: 1px dashed #000; 
//         margin: 6px 0;
//       }
      
//       .line-solid {
//         border-top: 1px solid #000;
//         margin: 6px 0;
//       }

//       .info-row {
//         display: flex;
//         justify-content: space-between;
//         margin: 2px 0;
//         font-size: 10px;
//       }
      
//       .info-label {
//         font-weight: bold;
//       }

//       .items-header {
//         display: flex;
//         justify-content: space-between;
//         font-weight: bold;
//         border-bottom: 1px solid #000;
//         padding: 4px 0;
//         font-size: 10px;
//       }
      
//       .item-row {
//         display: flex;
//         justify-content: space-between;
//         padding: 3px 0;
//         border-bottom: 1px dashed #ddd;
//         font-size: 10px;
//       }
      
//       .item-name {
//         flex: 1;
//         padding-right: 8px;
//         word-wrap: break-word;
//       }
      
//       .item-qty {
//         width: 30px;
//         text-align: center;
//       }
      
//       .item-amount {
//         width: 55px;
//         text-align: right;
//         font-weight: bold;
//       }

//       .summary {
//         margin-top: 8px;
//         font-size: 11px;
//       }
      
//       .summary-row {
//         display: flex;
//         justify-content: space-between;
//         padding: 3px 0;
//       }
      
//       .summary-row.total {
//         font-size: 13px;
//         font-weight: bold;
//         border-top: 1px solid #000;
//         border-bottom: 2px solid #000;
//         margin-top: 4px;
//         padding: 5px 0;
//       }

//       .footer {
//         text-align: center;
//         margin-top: 10px;
//         padding-top: 8px;
//         border-top: 1px dashed #000;
//         font-size: 10px;
//       }
      
//       .footer-title {
//         font-weight: bold;
//         margin-bottom: 4px;
//         font-size: 11px;
//       }

//       @media print {
//         body {
//           width: 2.5in;
//           margin: 0;
//           padding: 0;
//         }
        
//         .invoice {
//           width: 2.5in;
//           padding: 8px;
//         }
        
//         @page {
//           size: 2.5in auto;
//           margin: 0;
//         }
//       }
//     </style>
//   </head>
//   <body>
//     <div class="invoice">

//       <!-- HEADER -->
//       <div class="header-center">
        
//         <div class="brand">HELLO GUYS</div>
//           <div style="font-size:10px; margin-top:4px; text-align:center;">
//     Phone: +91 99031 06989
//   </div>

//   <div style="font-size:10px; text-align:center;">
//     Mail: sparkhelloguys@gmail.com
//   </div>

//   <div style="font-size:9px; text-align:center; margin-top:2px;">
//     Address: 021D, Ho-Chi-Minh Sarani, Shakuntala Park, Behala,<br/>
//     Kolkata 700061, West Bengal
//   </div>
//    <div style="font-size:10px; text-align:center;">
//     Website: www.helloguys.co.in
//   </div>
//       </div>

//       <!-- CUSTOMER INFO -->
//       <div class="info-row">
//         <span><span class="info-label">Customer:</span> ${invoice.Customer_Name || "Walk-in"}</span>
//       </div>

//       ${invoice.Customer_Phone ? `
//       <div class="info-row">
//         <span><span class="info-label">Phone:</span> ${invoice.Customer_Phone}</span>
//       </div>
//       ` : ""}

//       <div class="line"></div>

//       <!-- DATE / TIME / invoice -->
//       <div class="info-row">
//         <span><span class="info-label">Date:</span> ${new Date(invoice.Invoice_Date).toLocaleDateString("en-GB")}</span>
//         <span><span class="info-label">Time:</span> ${new Date(invoice.Invoice_Date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
//       </div>
//      <div class="info-row">
//   <span><span class="info-label">invoice:</span> ${Invoice_Id}</span>
// </div>

// <div style="text-align:center; font-weight:bold; font-size:11px; margin:4px 0;">
//   ${invoiceNumberData?.orderTypeLabel}
// </div>

//       <div class="line-solid"></div>

//       <!-- ITEMS HEADER -->
//       <div class="items-header">
//         <div style="width:30px;">#</div>
//         <div class="item-name">ITEM</div>
//         <div class="item-qty">QTY</div>
//         <div class="item-amount">AMOUNT</div>
//       </div>

//       <!-- ITEMS -->
//       ${
//         items?.map((it, i) => `
//           <div class="item-row">
//             <div style="width:30px;">${i + 1}</div>
//             <div class="item-name">${it.Item_Name}</div>
//             <div class="item-qty">${it.Item_Quantity}</div>
//             <div class="item-amount">₹${Number(it.Amount).toFixed(2)}</div>
//           </div>
//         `).join("")
//       }

//       <div class="line-solid"></div>

//       <!-- SUMMARY -->
//       <div class="summary">
//         <div class="summary-row total">
//           <span>TOTAL</span>
//           <span>₹${Number(invoice.Total).toFixed(2)}</span>
//         </div>
//       </div>

//       <!-- FOOTER -->
//       <div class="footer">
//         <div class="footer-title">THANK YOU!</div>
//         <div>Please Visit Again</div>
//       </div>

//     </div>

//    <!-- DOWNLOAD BUTTON -->
   




//   </body>
// </html>
// `;

// // return (
// //   <>
// //     {/* 🔴 Download Button */}
// //     <button
// //     style={{backgroundColor:"red"}}
// //       className="download-invoice-btn"
// //       onClick={() => {
// //         const blob = new Blob([html], { type: "text/html" });
// //         const url = URL.createObjectURL(blob);

// //         const a = document.createElement("a");
// //         a.href = url;
// //         a.download = `${Invoice_Id}.html`;
// //         a.click();

// //         URL.revokeObjectURL(url);
// //       }}
// //     >
// //       Download
// //     </button>

// //     {/* 🔹 Invoice HTML */}
// //     <div dangerouslySetInnerHTML={{ __html: html }} />

// //     {/* 🔹 Button Styles */}
// //     <style>{`
// //       .download-invoice-btn {
// //         position: fixed;
// //         top: 12px;
// //         right: 12px;
// //         z-index: 9999;
// //         background-color: red;
// //         color: white;
// //         padding: 10px 14px;
// //         border-radius: 4px;
// //         font-size: 14px;
// //         font-weight: bold;
// //         border: none;
// //         cursor: pointer;
// //       }

// //       /* 📱 Mobile screens */
// //       @media (max-width: 768px) {
// //         .download-invoice-btn {
// //           top: auto;
// //           bottom: 0;
// //           right: 0;
// //           left: 0;
// //           width: 100%;
// //           border-radius: 0;
// //           padding: 14px;
// //           font-size: 16px;
// //         }
// //       }

// //       /* 🖨️ Hide on print */
// //       @media print {
// //         .download-invoice-btn {
// //           display: none !important;
// //            background-color: red;
// //         }
// //       }
// //     `}</style>
// //   </>
// // );
// return (
//   <>
//     {/* 🔴 Download Button */}
//     {/* <button
//       className="download-invoice-btn"
//       style={{backgroundColor:"red"}}
//       onClick={() => {
//         const element = document.getElementById("invoice-pdf");

//         html2pdf()
//           .set({
//             margin: 0,
//             filename: `${Invoice_Id}.pdf`,
//             image: { type: "jpeg", quality: 0.98 },
//             html2canvas: { scale: 3, useCORS: true },
//             jsPDF: { unit: "in", format: [2.5, 11], orientation: "portrait" },
//           })
//           .from(element)
//           .save();
//       }}
//     >
//       Download
//     </button> */}

//     {/* 🔹 Invoice */}
//     <div id="invoice-pdf" dangerouslySetInnerHTML={{ __html: html }} />

//     {/* 🔹 Styles */}
//     {/* <style>{`
//       .download-invoice-btn {
//         position: fixed;
//         top: 12px;
//         right: 12px;
//         z-index: 9999;
//         background-color: red;
//         color: white;
//         padding: 10px 14px;
//         border-radius: 4px;
//         font-size: 14px;
//         font-weight: bold;
//         border: none;
//         cursor: pointer;
//       }

//       @media (max-width: 768px) {
//         .download-invoice-btn {
//           top: auto;
//           bottom: 0;
//           left: 0;
//           right: 0;
//           width: 100%;
//           border-radius: 0;
//           padding: 14px;
//           font-size: 16px;
//         }
//       }

//       @media print {
//         .download-invoice-btn {
//           display: none !important;
//         }
//       }
//     `}</style> */}
//   </>
// );

// }
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";




export default function InvoicePublicView() {
  const { Invoice_Id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderTypeLabel, setOrderTypeLabel] = useState("");

// const{data:invoiceNumberData}=useNextInvoiceNumberQuery();
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/staff/order/${Invoice_Id}`
        );

        // EXPECTED BACKEND RESPONSE:
        // { invoice: {...}, items: [...] }

        setInvoice(res.data.invoice);
         setOrderTypeLabel(res.data.orderTypeLabel);
        setItems(res.data.items);
      } catch (err) {
        setError("Unable to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [Invoice_Id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        Loading invoice...
      </div>
    );
  }
    // const getCurrentDate = () =>
    //   invoice?.Invoice_Date.toLocaleDateString("en-GB");

    // const getCurrentTime = () =>
    //   invoice?.Invoice_Date?.toLocaleTimeString("en-US", {
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     hour12: true,
    //   });

  if (error || !invoice) {
    return (
      <div style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>
        {error || "invoice not found"}
      </div>
    );
  }
const html = ` 
<!DOCTYPE html>
<html>
  <head>
    <title>invoice - ${Invoice_Id}</title>
    <meta charset="UTF-8">
    
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body { 
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px;
        line-height: 1.3;
        color: #000;
        width: 2.5in;
        margin: 0 auto;
        padding: 0;
      }
      
      .invoice {
        width: 2.5in;
        padding: 8px;
      }

      .header-center { 
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
        text-align: center; 
        margin-bottom: 8px;
        border-bottom: 1px dashed #000;
        padding-bottom: 8px;
      }
      
         
          .logo { 
            width: 60px; 
            height: auto; 
            margin-bottom: 4px;
            padding: 5px;
            background-color: black;
          }
      .brand { 
        font-size: 16px; 
        font-weight: bold; 
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 2px;
      }
      
      .line { 
        border-top: 1px dashed #000; 
        margin: 6px 0;
      }
      
      .line-solid {
        border-top: 1px solid #000;
        margin: 6px 0;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
        font-size: 10px;
      }
      
      .info-label {
        font-weight: bold;
      }

      .items-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        border-bottom: 1px solid #000;
        padding: 4px 0;
        font-size: 10px;
      }
      
      .item-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        border-bottom: 1px dashed #ddd;
        font-size: 10px;
      }
      
      .item-name {
        flex: 1;
        padding-right: 8px;
        word-wrap: break-word;
      }
      
      .item-qty {
        width: 30px;
        text-align: center;
      }
      
      .item-amount {
        width: 55px;
        text-align: right;
        font-weight: bold;
      }

      .summary {
        margin-top: 8px;
        font-size: 11px;
      }
      
      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
      }
      
      .summary-row.total {
        font-size: 13px;
        font-weight: bold;
        border-top: 1px solid #000;
        border-bottom: 2px solid #000;
        margin-top: 4px;
        padding: 5px 0;
      }

      .footer {
        text-align: center;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px dashed #000;
        font-size: 10px;
      }
      
      .footer-title {
        font-weight: bold;
        margin-bottom: 4px;
        font-size: 11px;
      }

      @media print {
        body {
          width: 2.5in;
          margin: 0;
          padding: 0;
        }
        
        .invoice {
          width: 2.5in;
          padding: 8px;
        }
        
        @page {
          size: 2.5in auto;
          margin: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="invoice">

      <!-- HEADER -->
      <div class="header-center">
        
        <div class="brand">HELLO GUYS</div>
          <div style="font-size:10px; margin-top:4px; text-align:center;">
    Phone: +91 99031 06989
  </div>

  <div style="font-size:10px; text-align:center;">
    Mail: sparkhelloguys@gmail.com
  </div>

  <div style="font-size:9px; text-align:center; margin-top:2px;">
    Address: 021D, Ho-Chi-Minh Sarani, Shakuntala Park, Behala,<br/>
    Kolkata 700061, West Bengal
  </div>
   <div style="font-size:10px; text-align:center;">
    Website: www.helloguys.co.in
  </div>
      </div>

      <!-- CUSTOMER INFO -->
      <div class="info-row">
        <span><span class="info-label">Customer:</span> ${invoice?.Customer_Name || "Walk-in"}</span>
      </div>

      ${invoice?.Customer_Phone ? `
      <div class="info-row">
        <span><span class="info-label">Phone:</span> ${invoice?.Customer_Phone}</span>
      </div>
      ` : ""}

      <div class="line"></div>

      <!-- DATE / TIME / invoice -->
      <div class="info-row">
        <span><span class="info-label">Date:</span> ${new Date(invoice.Invoice_Date).toLocaleDateString("en-GB")}</span>
        <span><span class="info-label">Time:</span> ${new Date(invoice.Invoice_Date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
      </div>
     <div class="info-row">
   <span><span class="info-label">invoice:</span> ${Invoice_Id}</span>
</div>

<div style="text-align:center; font-weight:bold; font-size:11px; margin:4px 0;">
  ${orderTypeLabel}
</div>

      <div class="line-solid"></div>

      <!-- ITEMS HEADER -->
      <div class="items-header">
        <div style="width:30px;">#</div>
        <div class="item-name">ITEM</div>
        <div class="item-qty">QTY</div>
        <div class="item-amount">AMOUNT</div>
      </div>

      <!-- ITEMS -->
      ${
        items?.map((it, i) => `
          <div class="item-row">
            <div style="width:30px;">${i + 1}.</div>
            <div class="item-name">${it.Item_Name}</div>
            <div class="item-qty">${it.Item_Quantity}</div>
            <div class="item-amount">₹${Number(it.Amount).toFixed(2)}</div>
          </div>
        `).join("")
      }

      <div class="line-solid"></div>

      <!-- SUMMARY -->
      
      <div class="summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹${Number(invoice?.Sub_Total ?? 0).toFixed(2)}</span>
            </div>
            ${Number(invoice?.Service_Charge ?? 0) > 0 ? `
            <div class="summary-row">
              <span>Service Charge</span>
              <span>₹${Number(invoice?.Service_Charge).toFixed(2)}</span>
            </div>
            ` : ''}
            ${invoice?.Discount && Number(invoice.Discount) > 0 ? `
            <div class="summary-row">
              <span>Discount</span>
              <span>${
                invoice.Discount_Type === "percentage"
                  ? `${invoice?.Discount}%`
                  : `₹${invoice?.Discount}`
              }</span>
            </div>
            ` : ''}
            <div class="summary-row total">
              <span>TOTAL</span>
               <span>₹${Number(invoice?.Total).toFixed(2)}</span>
            </div>
          </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-title">THANK YOU!</div>
        <div>Please Visit Again</div>
      </div>

    </div>

   <!-- DOWNLOAD BUTTON -->
   




  </body>
</html>
`;
// return (
//   <>
//     {/* 🔴 Download Button */}
//     <button
//     style={{backgroundColor:"red"}}
//       className="download-invoice-btn"
//       onClick={() => {
//         const blob = new Blob([html], { type: "text/html" });
//         const url = URL.createObjectURL(blob);

//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `${Invoice_Id}.html`;
//         a.click();

//         URL.revokeObjectURL(url);
//       }}
//     >
//       Download
//     </button>

//     {/* 🔹 Invoice HTML */}
//     <div dangerouslySetInnerHTML={{ __html: html }} />

//     {/* 🔹 Button Styles */}
//     <style>{`
//       .download-invoice-btn {
//         position: fixed;
//         top: 12px;
//         right: 12px;
//         z-index: 9999;
//         background-color: red;
//         color: white;
//         padding: 10px 14px;
//         border-radius: 4px;
//         font-size: 14px;
//         font-weight: bold;
//         border: none;
//         cursor: pointer;
//       }

//       /* 📱 Mobile screens */
//       @media (max-width: 768px) {
//         .download-invoice-btn {
//           top: auto;
//           bottom: 0;
//           right: 0;
//           left: 0;
//           width: 100%;
//           border-radius: 0;
//           padding: 14px;
//           font-size: 16px;
//         }
//       }

//       /* 🖨️ Hide on print */
//       @media print {
//         .download-invoice-btn {
//           display: none !important;
//            background-color: red;
//         }
//       }
//     `}</style>
//   </>
// );
return (
  <>
    {/* 🔴 Download Button */}
    {/* <button
      className="download-invoice-btn"
      style={{backgroundColor:"red"}}
      onClick={() => {
        const element = document.getElementById("invoice-pdf");

        html2pdf()
          .set({
            margin: 0,
            filename: `${Invoice_Id}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: "in", format: [2.5, 11], orientation: "portrait" },
          })
          .from(element)
          .save();
      }}
    >
      Download
    </button> */}

    {/* 🔹 Invoice */}
    <div id="invoice-pdf" dangerouslySetInnerHTML={{ __html: html }} />

    {/* 🔹 Styles */}
    {/* <style>{`
      .download-invoice-btn {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 9999;
        background-color: red;
        color: white;
        padding: 10px 14px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
        border: none;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .download-invoice-btn {
          top: auto;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          border-radius: 0;
          padding: 14px;
          font-size: 16px;
        }
      }

      @media print {
        .download-invoice-btn {
          display: none !important;
        }
      }
    `}</style> */}
  </>
);

}

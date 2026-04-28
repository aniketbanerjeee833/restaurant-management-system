
import { memo, useState } from 'react';
import {
  FileText, Calendar, DollarSign, ShoppingCart, Users,
  Table2, ChevronDown, User, ChevronUp, Trash2
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useDeleteInvoiceMutation, useGetAllInvoicesOfOrdersAndTakeawaysInDateRangeQuery, useUpdateTakeawayAndDineInDeliveryStatusMutation } from '../../redux/api/Staff/orderApi';
import Spinner from '../../components/Layout/Spinner';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useGetUserQuery } from '../../redux/api/userApi';
import DeleteFoodItemModal from '../../components/Modal/DeleteFoodItemModal';


// export default function AllOrdersTakeawayDateRange() {
//   const InvoiceSkeleton = () => {
//     return (
//       <div className="bg-white rounded-lg p-4 mb-3 shadow-sm animate-pulse">
//         <div className="flex justify-between items-center mb-3">
//           <div className="h-4 bg-gray-200 rounded w-1/4" />
//           <div className="h-4 bg-gray-200 rounded w-16" />
//         </div>

//         <div className="space-y-2">
//           <div className="h-3 bg-gray-200 rounded w-1/2" />
//           <div className="h-3 bg-gray-200 rounded w-1/3" />
//           <div className="h-3 bg-gray-200 rounded w-2/3" />
//         </div>
//       </div>
//     );
//   };
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearch, setDebouncedSearch] = useState('');
//   const [expandedInvoice, setExpandedInvoice] = useState(null);
//   const [page, setPage] = useState(1);
//   const { fromDate, toDate } = useParams();
//   //   const {date}=useParams();
//   console.log(fromDate, toDate);
//   const [updateTakeawayAndDineInDeliveryStatus] = useUpdateTakeawayAndDineInDeliveryStatusMutation();
//   const { data: userMe } = useGetUserQuery();
//   console.log(userMe, "userMe")
//   // const dispatch=useDispatch()
//   // Format date
//   const { data: allInvoicesAndOrderInDateRange,
//     isLoading: isLoadingInvoicesAndOrdersInDateRange,
//     isFetching: isFetchingAllInvoicesAndOrderInDateRange

//   } = useGetAllInvoicesOfOrdersAndTakeawaysInDateRangeQuery({
//     fromDate, toDate, page,
//     search: debouncedSearch
//   });
//   useEffect(() => {
//     setPage(1);
//   }, [debouncedSearch]);
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const handlePageChange = (newPage) => {
//     setPage(newPage);
//   }
//   const handleNextPage = () => {
//     setPage(page + 1);
//   }
//   const handlePreviousPage = () => {
//     setPage(page - 1);
//   }
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(searchTerm);
//     }, 400); // 400ms is perfect for POS

//     return () => clearTimeout(timer);
//   }, [searchTerm]);


//   const [selectedInvoice, setSelectedInvoice] = useState(null);
//   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

//   const [deleteInvoice, { isLoading: isInvoiceDeleting }] = useDeleteInvoiceMutation();
//   // Filter invoices
//   //const invoiceData=allInvoicesAndOrderInDateRange?.data??[]
//   //  console.log(allInvoicesAndOrderInDateRange,invoiceData);

//   //   const filteredInvoices = invoiceData.filter(data =>
//   //     data.invoice.Invoice_Id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //     data.invoice.Order_Id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//   //     data.items?.some(item => item.Item_Name?.toLowerCase().includes(searchTerm.toLowerCase()))
//   //   );

//   //   const dineInvoices=filteredInvoices.filter(invoice=>invoice.invoice.orderType==="dine")
//   //   const takeAwayInvoices=filteredInvoices.filter(invoice=>invoice.invoice.orderType==="takeaway")
//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'paid': return '#4CAF50';
//       case 'pending': return '#ff9800';
//       case 'cancelled': return '#f44336';
//       case 'completed': return '#4CAF50';
//       default: return '#9e9e9e';
//     }
//   };
//   const invoiceData = allInvoicesAndOrderInDateRange?.data ?? [];
//   console.log(invoiceData);
//   // const dineInvoices = invoiceData?.filter(
//   //   inv => inv?.invoice.orderType === "dine"
//   // );

//   // const takeAwayInvoices = invoiceData.filter(
//   //   inv => inv.invoice.orderType === "takeaway" || inv.invoice.orderType === "pre-book"
//   // );
//   /* ================= DINE-IN ================= */
//   const dineInvoices = invoiceData.filter(inv => {
//     // normal dine
//     if (inv.originalOrderType !== "pre-book" && inv.orderType === "dine") {
//       return true;
//     }

//     // pre-book with tables
//     if (inv.originalOrderType === "pre-book" && inv.tables?.length > 0) {
//       return true;
//     }

//     return false;
//   });

//   /* ================= TAKEAWAY ================= */
//   const takeAwayInvoices = invoiceData.filter(inv => {
//     // normal takeaway
//     if (inv.originalOrderType !== "pre-book" && inv.orderType === "takeaway") {
//       return true;
//     }

//     // pre-book without tables
//     if (inv.originalOrderType === "pre-book" && (!inv.tables || inv.tables.length === 0)) {
//       return true;
//     }

//     return false;
//   });

//   console.log(allInvoicesAndOrderInDateRange, "allInvoicesAndOrderInDateRange");
//   console.log(dineInvoices, takeAwayInvoices, "dineInvoices", "takeAwayInvoices");
//   // Toggle expand/collapse

//   const toggleExpand = (invoiceId) => {
//     setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
//   };
//   const printKOTInvoice = (kitchens, orderType, tables) => {
//     console.log(kitchens, "kitchens");
//     const getCurrentDate = () =>
//       new Date().toLocaleDateString("en-GB");

//     const getCurrentTime = () =>
//       new Date().toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });
//     const tableNames =
//       orderType === "dine" && Array.isArray(tables)
//         ? tables.map(t => t.Table_Name).join(", ")
//         : "";

//     //   const kitchenSections = kitchens
//     //     .map((kitchen, index) => `
//     //   ${index > 0 ? `<div class="line"></div>` : ``}

//     //   <div class="invoice-kitchen">
//     //     <div class="header-center">
//     //       ${orderType == "takeaway" ?
//     //         `<div class="brand">TAKEAWAY</div>` :
//     //         `<div class="brand">DINE-IN</div>`
//     //       }
//     //           ${orderType === "dine" && tableNames
//     //         ? `<div style="font-size:16px;font-weight:800">TABLE: ${tableNames}</div>`
//     //         : ``
//     //       }
//     //       <div class="brand">${kitchen.name}</div>
//     //     </div>

//     //     <div class="info-row date-time">
//     //       <span><b>Date:</b> ${getCurrentDate()}</span>
//     //       <span><b>Time:</b> ${getCurrentTime()}</span>
//     //     </div>

//     //     <div class="line-solid"></div>

//     //     <div class="items-header">
//     //       <div class="col-no">No</div>
//     //       <div class="item-name">ITEM</div>
//     //       <div class="item-qty">QTY</div>
//     //     </div>

//     //     ${kitchen.items.map((it, i) => `
//     //       <div class="item-row">
//     //         <div class="col-no">${i + 1}</div>
//     //         <div class="item-name">${it.Item_Name}</div>
//     //         <div class="item-qty">${it.Quantity ?? it.Item_Quantity}</div>
//     //       </div>
//     //     `).join("")}
//     //   </div>
//     // `)
//     //     .join("");
//     const kitchenSections = Object.entries(kitchens)
//       .map(([kitchenName, items], index) => `
//       ${index > 0 ? `<div class="line"></div>` : ``}

//       <div class="invoice-kitchen">
        
//              <div class="header-center">
//         ${orderType == "takeaway" ?
//           `<div class="brand">TAKEAWAY</div>` :
//           `<div class="brand">DINE-IN</div>`
//         }
//            ${orderType === "dine" && tableNames
//           ? `<div style="font-size:16px;font-weight:800">TABLE: ${tableNames}</div>`
//           : ``
//         }
//         <div class="brand">${kitchenName}</div>
//       </div>

//         <div class="info-row date-time">
//           <span><b>Date:</b> ${getCurrentDate()}</span>
//           <span><b>Time:</b> ${getCurrentTime()}</span>
//         </div>

//         <div class="line-solid"></div>

//         <div class="items-header">
//           <div class="col-no">No</div>
//           <div class="item-name">ITEM</div>
//           <div class="item-qty">QTY</div>
//         </div>

//         ${items.map((it, i) => `
//           <div class="item-row">
//             <div class="col-no">${i + 1}</div>
//             <div class="item-name">${it.Item_Name}</div>
//             <div class="item-qty">${it.Item_Quantity}</div>
//           </div>
//         `).join("")}
//       </div>
//     `)
//       .join("");

//     const html = `<!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <style>
//   body {
//     font-family: 'Courier New', monospace;
//     font-size: 16px;
//     font-weight: 700;
//     width: 58mm;
//     margin: 0;
//   }
//   .invoice { width: 48mm; padding: 2mm; }
//   .invoice-kitchen { margin-top: 8px; }
//   .header-center {
//     text-align: center;
//     border-bottom: 1px dashed #000;
//     margin-bottom: 6px;
//     padding-bottom: 6px;
//   }
//   .brand { font-size: 20px; font-weight: 800; }
//   .line { border-top: 1px dashed #000; margin: 6px 0; }
//   .line-solid { border-top: 1px solid #000; margin: 5px 0; }
//   .items-header, .item-row {
//     display: flex;
//     justify-content: space-between;
//     font-size: 15px;
//   }
//   .items-header { border-bottom: 1px solid #000; font-weight: 800; gap: 4px; padding-bottom: 4px; }
//   .col-no { width: 5mm; }
//   .item-name { flex: 1; }
//   .item-qty { width: 6mm; text-align: center; }
//   .info-row.date-time {
//     display: flex;
    
//     justify-content: space-between;
//     font-size: 12px;
//   }
  
//   @page { size: 48mm auto; margin: 0; }
//             /* PRINT STYLES */
//           @media print {
//             body {
//               width: 58mm;
//               margin: 0;
//               padding: 0;
//             }
            
//             .invoice {
//               width: 58mm;
//               padding: 8px;
//             }
            
//             @page {
//               size: 58mm auto;
//               margin: 0;
//             }
            
//             .no-print {
//               display: none !important;
//             }
//           }
// </style>
// </head>
// <body>
//   <div class="invoice">
//     ${kitchenSections}
//   </div>
// </body>
// </html>`;
//     // const win = window.open(
//     //   "",
//     //   "_blank",
//     //   `width=${screen.width},height=${screen.height},left=0,top=0`
//     // );
//     // const win = window.open(
//     //   "",
//     //   "_blank",
//     //   "width=800,height=600,left=0,top=0"
//     // );
//     // if (!win) return;

//     // win.document.open();
//     // win.document.write(html);
//     // win.document.close();

//     // win.onload = () => {
//     //   setTimeout(() => {
//     //     win.focus();
//     //     win.print();
//     //     win.close();
//     //   }, 300);
//     // };


//     const iframe = document.createElement("iframe");
//     iframe.style.display = "none";
//     document.body.appendChild(iframe);

//     iframe.contentDocument.open();
//     iframe.contentDocument.write(html);
//     iframe.contentDocument.close();

//     iframe.onload = () => {
//       iframe.contentWindow.print();
//     };

//     setTimeout(() => document.body.removeChild(iframe), 1000);
//   };
//   const printBillInvoice = (data) => {
//     if (!data) return;

//     const { invoice, order, items = [], tables = [], orderType } = data;
//     console.log(data, "datainvoice");
//     const getCurrentDate = () =>
//       new Date().toLocaleDateString("en-GB");

//     const getCurrentTime = () =>
//       new Date().toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       });

//     const tableNames =
//       orderType === "dine" && tables.length
//         ? tables.map(t => t.Table_Name).join(", ")
//         : "TAKEAWAY";

//     const html = `<!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <title>Invoice ${invoice.Invoice_Id}</title>
// <style>
//   * { margin:0; padding:0; box-sizing:border-box; }

//   body {
//     font-family: 'Courier New', monospace;
//     font-size: 11px;
//     font-weight: 700;
//     width: 58mm;
  
//       margin: 0;
//       padding: 0;
//   }

//   .invoice { width: 48mm; padding: 2mm; margin: 0 auto; }

//   .header-center {
//     text-align: center;
//     border-bottom: 1px dashed #000;
//     padding-bottom: 6px;
//     margin-bottom: 6px;
//   }

//   .brand { font-size: 15px; font-weight: 900; }

//   .line { border-top: 1px dashed #000; margin: 5px 0; }
//   .line-solid { border-top: 1px solid #000; margin: 5px 0; }


//        .info-row.date-time {
//   display: flex;
//   justify-content: space-between;
//   font-size: 9px;
//   font-weight: 700;
//   width: 100%;
// }
// .info-row.date-time span {
//   white-space: nowrap;   /* 🔥 prevents wrapping */
// }
//     .info-label {
//       font-weight: 800;
//     }

//   .items-header, .item-row {
//     display: flex;
//     justify-content: space-between;
//     font-size: 10px;
//     width: 100%;
//   }

//   .items-header {
//     border-bottom: 1px solid #000;
//     font-weight: 800;
//     padding-bottom: 3px;
//   }

//   .item-row {
//     border-bottom: 1px dashed #ccc;
//     padding: 2px 0;
//   }

//   .col-no { width: 5mm; }
//   .item-name { flex: 1; padding-right: 2mm; }
//   .item-qty { width: 6mm; text-align: center; }
//   .item-amount { width: 10mm; text-align: right; }

//   .summary {
//     margin-top: 6px;
//     font-size: 11px;
//   }

//   .summary-row {
//     display: flex;
//     justify-content: space-between;
//     margin: 2px 0;
//   }
//  .service-percentage {
//   white-space: nowrap;
// }
 
// .discount-percentage {
// white-space: nowrap;
// }
//   .summary-row.total {
//     font-size: 13px;
//     font-weight: 900;
//     border-top: 1px solid #000;
//     border-bottom: 2px solid #000;
//     padding: 4px 0;
//   }

//   .footer {
//     text-align: center;
//     margin-top: 8px;
//     border-top: 1px dashed #000;
//     padding-top: 6px;
//     font-size: 10px;
//   }

//   @media print {
//       @page {
//         size: 58mm auto;
//         margin: 0;
//       }
//     }
// </style>
// </head>

// <body>
//   <div class="invoice">

//     <div class="header-center">
//       <div class="brand" style="font-weight:900;">HELLO GUYS</div>
//       <div>Ph: +91 9903106989</div>
  
//       <div style="font-size:9px">
//         Address:Shakuntala Park, Kolkata 700061
//       </div>
     
//     </div>

//     ${invoice.Customer_Name ? `
//       <div class="info-row">
//        <span class="info-label">Customer:</span>
//         <span>${invoice.Customer_Name}</span>
//       </div>` : ``}

//     ${invoice.Customer_Phone ? `
//       <div class="info-row">
//       <span class="info-label">Phone:</span>
//         <span>${invoice.Customer_Phone}</span>
//       </div>` : ``}

//     <div class="line"></div>

//     ${orderType == "dine" ? `<div class="header-center">
//       <b>TABLE:${tableNames}</b>
//     </div>` : `<div class="header-center">
//       <b>TAKEAWAY</b>
//     </div>`}
     

//     <div class="info-row date-time">
//       <span>Date: ${getCurrentDate()}</span>
//       <span>Time: ${getCurrentTime()}</span>
//     </div>

  
//     <div class="info-row">
//       <span><b>Invoice:</b> ${invoice.Invoice_Id || "-"}</span>
//     </div>

//     <div class="line-solid"></div>

//     <div class="items-header">
//       <div class="col-no">No</div>
//       <div class="item-name">ITEM</div>
//       <div class="item-qty">QTY</div>
//       <div class="item-amount">AMT</div>
//     </div>

//     ${items.map((it, i) => `
//       <div class="item-row">
//         <div class="col-no">${i + 1}</div>
//         <div class="item-name">${it.Item_Name}</div>
//         <div class="item-qty">${it.Quantity}</div>
//         <div class="item-amount">₹${Number(it.Amount).toFixed(2)}</div>
//       </div>
//     `).join("")}

//     <div class="line-solid"></div>

//     <div class="summary">
//       <div class="summary-row">
//         <span>Subtotal</span>
//         <span>₹${Number(order?.Sub_Total).toFixed(2)}</span>
//       </div>
// ${Number(invoice?.Discount || 0) > 0 ? `
// <div class="summary-row">
//   <span>Discount&nbsp;</span>
//   <span class="discount-percentage">
//     ${
//       invoice?.Discount_Type === "percentage"
//         ? `${String(invoice.Discount).padStart(2, " ")}% ₹${invoice?.Discount_Amount?.toFixed(2)}`
//         : `₹${invoice?.Discount_Amount?.toFixed(2)}`
//     }
//   </span>
// </div>
// ` : ``}
//       ${Number(invoice?.Service_Charge || 0) > 0 ? `
// <div class="summary-row">
//   <span>Dine-In Charge&nbsp;</span>
//   <span class="service-percentage">
//     ${
//       invoice?.Service_Charge_Type === "percentage"
//         ? `${String(invoice.Service_Charge).padStart(2, " ")}% ₹${invoice?.Service_Charge_Amount?.toFixed(2)}`
//         : `₹${invoice?.Service_Charge_Amount?.toFixed(2)}`
//     }
//   </span>
// </div>
// ` : ``}

//       <div class="summary-row total">
//         <span>TOTAL</span>
//         <span>₹${Number(invoice.Amount).toFixed(2)}</span>
//       </div>
//     </div>

//     <div class="footer">
//       <b>THANK YOU!</b><br/>
//       Please Visit Again
//     </div>

//   </div>
// </body>
// </html>`;

//     /* -------- SILENT PRINT -------- */
//     const iframe = document.createElement("iframe");
//     iframe.style.display = "none";
//     document.body.appendChild(iframe);

//     const doc = iframe.contentWindow.document;
//     doc.open();
//     doc.write(html);
//     doc.close();

//     iframe.onload = () => iframe.contentWindow.print();

//     setTimeout(() => document.body.removeChild(iframe), 1000);
//   };
//   const handleInvoiceDelete = async () => {
//     try {
//       await deleteInvoice({
//         Invoice_Id: selectedInvoice.Invoice_Id,
//         orderType: selectedInvoice.orderType, // "dine" | "takeaway"
//       }).unwrap();

//       toast.success("Invoice deleted");
//       setShowDeleteConfirmation(false);
//       //refetch(); // ✅ FORCE immediate refresh
//       // dispatch(orderApi.util.invalidateTags(["Order"]));
//     } catch (err) {
//       console.error(err);
//       toast.error("Invoice deletion failed");
//     }
//   };
//   const handleDeliveryStatus = async (order, Delivery_Status, orderType) => {
//     if (!order || !orderType) return;
//     console.log("handleDeliveryStatus", order, Delivery_Status, orderType);
//     const payload =
//     {
//       orderType: "takeaway",
//       Takeaway_Order_Id: order.Takeaway_Order_Id,
//       Delivery_Status,
//     };
//     console.log(payload);
//     try {
//       const res = await updateTakeawayAndDineInDeliveryStatus(payload).unwrap();

//       toast.success(res.message || "Status updated successfully!");
//       console.log("✅ Status updated:", res);

//     } catch (error) {
//       console.error("❌ Failed to update delivery status", error);
//       toast.error("Failed to update delivery status");
//     }
//   };

//   const InvoiceCard = memo(({ data }) => {
//     const isTakeawayOrDineInDelivered = data?.order?.Delivery_Status?.toLowerCase() === "delivered";
//     const isExpanded = expandedInvoice === data.invoice.Invoice_Id;
//     console.log(data)
//     return (
//       <div
//         style={{

//           backgroundColor: isTakeawayOrDineInDelivered ? "#e9ffea" : "#ffa600",
//           borderRadius: "8px",
//           overflow: "hidden",
//           marginBottom: "10px",

//           // ✅ GREEN BORDER WHEN DELIVERED TAKEAWAY
//           border: isTakeawayOrDineInDelivered
//             ? "1px solid #22c55e"
//             : "1px solid #fff",

//           // boxShadow: isTakeawayOrDineInDelivered
//           //   ? "0 0 0 2px rgba(34,197,94,0.25)"
//           //   : "0 2px 8px rgba(0,0,0,0.1)",

//           transition: "all 0.2s ease",
//         }}
//       >
//         {/* INVOICE HEADER */}
//         <div
//           style={{
//             padding: '16px',
//             cursor: 'pointer',

//             backgroundColor: isTakeawayOrDineInDelivered ? "#e9ffea" : "#fff ",

//             transition: 'background-color 0.2s'
//           }}
//         // onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
//         // onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
//         >
//           {/* <div
//   className={`
//     grid
//     grid-cols-3 grid-rows-2
//     sm:grid-rows-1
//     ${data?.orderType === "dine"
//       ? "sm:grid-cols-6"
//       : "sm:grid-cols-5"}
//   `}
//   style={{ margin: 0, alignItems: "center" }}
// > */}
//           {/* <div className='flex justify-between mb-3'>
            
// <div>
//   {data?.originalOrderType === "pre-book" && <h6
//     className="text-2xl font-bold uppercase"
//     style={{
//       color:
        
//            "#ebb811"        // 🟣 Pre_Order
          
//     }}
//   >
//  PRE ORDER
//   </h6>}
//      </div>       {/* <div>
//               {data?.orderType === "pre-book" && <h6
//                 className="text-2xl font-bold uppercase"
//                 style={{
//                   color:
//                     data?.orderType === "pre-book"
//                       ? "#ebb811"        // 🟣 Pre_Order
//                       : "#374151",       // default
//                 }}
//               >
//                 PRE ORDER
//               </h6>}
//             </div> 

//             <div className="flex gap-2 justify-end items-end">
//               {userMe?.user.role === "admin" && (
//                 <div className='flex gap-2'>
//                   <Trash2
//                     onClick={() => {
//                       //setSelectedItem(foodItem);     // ← STORE PARTY CLICKED
//                       //handleSoftDeleteFoodItem(foodItem.Item_Id);
//                       // setSelectedInvoice(data.invoice);
//                       // setSelectedOrderType(data.orderType);
//                       setSelectedInvoice({
//                         Invoice_Id: data.invoice.Invoice_Id,
//                         orderType: data.invoice.orderType, // "dine" | "takeaway"
//                       })
//                       setShowDeleteConfirmation(true)
//                       // setIsInvoiceDeleted(true)
//                     }}
//                     style={{
//                       cursor: "pointer",
//                       backgroundColor: "transparent",
//                       color: "#ff0000"
//                     }} />

//                 </div>
//               )}
//               {data?.orderType === "takeaway" && (
//                 <button
//                   type="button"
//                   disabled={data?.order?.Delivery_Status === "delivered"}
//                   style={{
//                     backgroundColor:
//                       data?.order?.Delivery_Status === "pending"
//                         ? "#7e89eeff"
//                         : "#4CAF50"
//                   }}
//                   onClick={() => {
//                     const nextStatus =
//                       data?.order?.Delivery_Status === "pending"
//                         ? "delivered"
//                         : "pending";

//                     handleDeliveryStatus(
//                       {
//                         Order_Id: data?.order?.Order_Id,
//                         Takeaway_Order_Id: data?.order?.Takeaway_Order_Id,
//                       },
//                       nextStatus,
//                       data?.orderType
//                     );
//                   }}
//                   className="px-2 py-1 text-sm  font-semibold text-white
//                 cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
//                 >
//                   {data?.order?.Delivery_Status === "pending"
//                     ? "Pending"
//                     : "Delivered"}
//                 </button>
//               )}


//               {(data?.orderType === "takeaway" || data?.orderType === "dine") && <button
//                 style={{ backgroundColor: "#ffa600", whiteSpace: "nowrap" }}
//                 type="button"
//                 onClick={() => printKOTInvoice(data.kitchens, data.orderType, data.tables)}
//                 //disabled={isTakeawayCancelOrderLoading}
//                 //onClick={()=>handleCancelTakeawayOrder(order?.Takeaway_Order_Id)}
//                 className="px-2 py-1 text-sm  font-semibold text-white
//                 cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
//               >
//                 Print KOT
//               </button>}

//               {(data?.orderType === "takeaway" || data?.orderType === "dine") && <button
//                 type="button"
//                 style={{ backgroundColor: "#ff0000", whiteSpace: "nowrap" }}
//                 onClick={() => printBillInvoice(data)}
//                 //disabled={isTakeawayCancelOrderLoading}
//                 //onClick={()=>handleCancelTakeawayOrder(order?.Takeaway_Order_Id)}
//                 className="px-2 py-1 text-sm  font-semibold text-white
//                 cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
//               >
//                 Print Bill
//               </button>}
//             </div>
//           </div> */}

//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">

//             {/* LEFT: PRE ORDER TITLE */}
//             <div className=" flex items-center justify-center sm:items-left">
//               {data?.originalOrderType === "pre-book" && (
//                 <h6
//                   className="text-2xl font-bold uppercase"
//                   style={{
//                     color: "#ebb811", // 🟣 Pre Order
//                   }}
//                 >
//                   PRE ORDER
//                 </h6>
//               )}
//             </div>

//             {/* RIGHT: ACTION BUTTONS */}
//             <div className="flex flex-wrap gap-2 justify-end items-end">

//               {/* DELETE — ADMIN ONLY */}
//               {userMe?.user.role === "admin" && (
//                 <div className="flex gap-2">
//                   <Trash2
//                     onClick={() => {
//                       setSelectedInvoice({
//                         Invoice_Id: data.invoice.Invoice_Id,
//                         orderType: data.invoice.orderType, // "dine" | "takeaway"
//                       });
//                       setShowDeleteConfirmation(true);
//                     }}
//                     style={{
//                       cursor: "pointer",
//                       backgroundColor: "transparent",
//                       color: "#ff0000",
//                     }}
//                   />
//                 </div>
//               )}

//               {/* TAKEAWAY DELIVERY STATUS */}
//               {data?.orderType === "takeaway" && (
//                 <button
//                   type="button"
//                   disabled={data?.order?.Delivery_Status === "delivered"}
//                   style={{
//                     backgroundColor:
//                       data?.order?.Delivery_Status === "pending"
//                         ? "#7e89eeff"
//                         : "#4CAF50",
//                     whiteSpace: "nowrap",
//                   }}
//                   onClick={() => {
//                     const nextStatus =
//                       data?.order?.Delivery_Status === "pending"
//                         ? "delivered"
//                         : "pending";

//                     handleDeliveryStatus(
//                       {
//                         Order_Id: data?.order?.Order_Id,
//                         Takeaway_Order_Id: data?.order?.Takeaway_Order_Id,
//                       },
//                       nextStatus,
//                       data?.orderType
//                     );
//                   }}
//                   className="px-2 py-1 text-sm font-semibold text-white
//                    cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
//                 >
//                   {data?.order?.Delivery_Status === "pending"
//                     ? "Pending"
//                     : "Delivered"}
//                 </button>
//               )}

//               {/* PRINT KOT */}
//               {/* {(data?.orderType === "takeaway" || data?.orderType === "dine") && (
//       <button
//         style={{ backgroundColor: "#ffa600", whiteSpace: "nowrap" }}
//         type="button"
//         onClick={() =>
//           printKOTInvoice(data.kitchens, data.orderType, data.tables)
//         }
//         className="px-2 py-1 text-sm font-semibold text-white
//                    cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
//       >
//         Print KOT
//       </button>
//     )} */}
//               {(data?.originalOrderType !== "pre-book" &&
//                 (data?.orderType === "takeaway" || data?.orderType === "dine")) && (
//                   <button
//                     type="button"
//                     style={{ backgroundColor: "#ffa600", whiteSpace: "nowrap" }}
//                     onClick={() =>
//                       printKOTInvoice(data.kitchens, data.orderType, data.tables)
//                     }
//                     className="px-2 py-1 text-sm font-semibold text-white
//                cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
//                   >
//                     Print KOT
//                   </button>
//                 )}

//               {/* PRINT BILL */}
//               {(data?.orderType === "takeaway" || data?.orderType === "dine") && (
//                 <button
//                   type="button"
//                   style={{ backgroundColor: "#ff0000", whiteSpace: "nowrap" }}
//                   onClick={() => printBillInvoice(data)}
//                   className="px-2 py-1 text-sm font-semibold text-white
//                    cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
//                 >
//                   Print Bill
//                 </button>
//               )}

//             </div>
//           </div>

//           {/* <div
//   className="grid grid-rows-2 sm:grid-rows-1"
//   style={{
//     alignItems: "center",
//     gridTemplateColumns: "1.2fr 1fr 1fr 2fr 1fr 1fr",
//   }}
// > */}

//           <div
//             className="
//     grid
//     grid-cols-3
//     gap-y-3
//     sm:grid-cols-6
//     sm:gap-y-0
//     items-center
//   "
//           >




//             {/* Invoice ID */}
//             <div style={{ marginBottom: '10px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <FileText size={20} style={{ color: '#ff0000' }} />
//                 <div>
//                   <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
//                     {data.invoice.Invoice_Id}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Date */}
//             <div style={{ marginBottom: '10px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <Calendar size={18} style={{ color: '#666' }} />
//                 <div style={{ fontSize: '12px', color: '#666' }}>
//                   {formatDate(data?.invoice?.Invoice_Date)}
//                 </div>
//               </div>
//             </div>

//             {/* Status */}
//             <div className="grid justify-items-end sm:justify-items-start" style={{ marginBottom: '10px' }}>
//               <span
//                 style={{
//                   backgroundColor: getStatusColor(data.order.Status),
//                   color: '#fff',
//                   padding: '6px 14px',
//                   borderRadius: '20px',
//                   fontSize: '12px',
//                   fontWeight: 'bold',
//                   textTransform: 'uppercase',
//                   display: 'inline-block'
//                 }}
//               >
//                 {data?.order?.Status === "completed" ? "Paid" : data?.order?.Status}
//               </span>
//             </div>

//             {/* Customer Info */}
//             <div style={{ marginBottom: '10px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <User size={18} style={{ color: '#666' }} />
//                 <div style={{ fontSize: '12px', color: '#666' }}>
//                   <span>{data?.invoice?.Customer_Name}</span>
//                   <span> - {data?.invoice?.Customer_Phone}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Tables */}
//             {/* {data?.orderType === 'dine' && <div style={{ marginBottom: '10px' }}>
//               {data?.tables && (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <Table2 size={18} style={{ color: '#666' }} />
//                   <div style={{ fontSize: '12px', color: '#666' }}>
//                     {data?.tables?.map(t => t?.Table_Name).join(', ') || 'N/A'}
//                   </div>
//                 </div>
//               )}
//             </div>} */}
//             {/* Tables (COLUMN ALWAYS EXISTS) */}
//             <div
//               style={{
//                 marginBottom: "10px",
//                 visibility: data?.orderType === "dine" ? "visible" : "hidden",
//               }}
//             >
//               {data?.orderType === "dine" && data?.tables && (
//                 <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                   <Table2 size={18} style={{ color: "#666" }} />
//                   <div style={{ fontSize: "12px", color: "#666" }}>
//                     {data.tables.map(t => t.Table_Name).join(", ")}
//                   </div>
//                 </div>
//               )}
//             </div>



//             {/* Amount */}
//             <div className="flex justify-end gap-2" style={{ marginBottom: '10px' }}>
//               <div style={{ textAlign: 'right' }}>
//                 <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff0000' }}>
//                   ₹{parseFloat(data?.invoice?.Amount).toFixed(2)}
//                 </div>
//                 <div style={{ fontSize: '12px', color: '#666' }}>
//                   {data.items?.length || 0} items
//                 </div>
//               </div>
//               <div style={{ textAlign: 'right' }}>
//                 {isExpanded ? (
//                   <ChevronUp onClick={() => toggleExpand(data?.invoice?.Invoice_Id)} />
//                 ) : (
//                   <ChevronDown onClick={() => toggleExpand(data?.invoice?.Invoice_Id)} />
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* EXPANDED DETAILS */}
//         {isExpanded && (
//           <div style={{ padding: '16px', backgroundColor: '#fff' }}>

//             {/* Items Table */}
//             <div style={{ marginBottom: '20px' }}>
//               <h5 style={{
//                 fontSize: '16px',
//                 fontWeight: 'bold',
//                 marginBottom: '15px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}>
//                 <ShoppingCart size={18} style={{ color: '#ff0000' }} />
//                 Order Items
//               </h5>

//               <div style={{ overflowX: 'auto' }}>
//                 <table style={{
//                   width: '100%',
//                   borderCollapse: 'collapse',
//                   fontSize: '14px'
//                 }}>
//                   <thead>
//                     <tr style={{ backgroundColor: '#f5f5f5' }}>
//                       <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//                         Item Name
//                       </th>
//                       <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//                         Quantity
//                       </th>
//                       <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
//                         Price
//                       </th>
//                       <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
//                         Amount
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {data?.items?.map((item, idx) => (
//                       <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
//                         <td style={{ padding: '12px', fontWeight: '500' }}>
//                           {item?.Item_Name}
//                         </td>
//                         <td style={{ padding: '12px', textAlign: 'center' }}>
//                           {item?.Quantity}
//                         </td>
//                         <td style={{ padding: '12px', textAlign: 'right' }}>
//                           ₹{parseFloat(item?.Price).toFixed(2)}
//                         </td>
//                         <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
//                           ₹{parseFloat(item?.Amount).toFixed(2)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Summary */}
//             <div style={{
//               display: 'flex',
//               justifyContent: 'flex-end',
//               borderTop: '2px solid #e0e0e0',
//               paddingTop: '15px'
//             }}>
//               <div
//                 style={{
//                   minWidth: '220px',
//                   width: '100%',
//                   maxWidth: '360px',   // 👈 prevents overflow on small screens
//                 }}
//               >
//                 {/* <div style={{ minWidth: '300px' }}> */}
//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   padding: '8px 0',
//                   fontSize: '14px'
//                 }}>
//                   <span style={{ color: '#666' }}>Subtotal:</span>
//                   <span style={{ fontWeight: '500' }}>
//                     ₹{parseFloat(data?.invoice?.Sub_Total || data?.order?.Sub_Total).toFixed(2)}
//                   </span>
//                 </div>

//                 {data?.invoice?.Discount && (
//                   <div style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     padding: '8px 0',
//                     fontSize: '14px'
//                   }}>
//                     <span style={{ color: '#666' }}>Discount:</span>
//                     <span style={{ fontWeight: '500' }}>
//                       {`₹${parseFloat(data?.invoice?.Discount_Amount).toFixed(2)}`}
//                     </span>
//                     {/* <span style={{ fontWeight: '500' }}>
//                       {data?.invoice?.Discount_Type === 'percentage' ?
//                         `${data?.invoice?.Discount}%` :
//                         `₹${parseFloat(data?.invoice?.Discount).toFixed(2)} `}
//                     </span> */}
//                   </div>
//                 )}

//                 {data?.invoice?.Service_Charge && (
//                   <div style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     padding: '8px 0',
//                     fontSize: '14px'
//                   }}>
//                     <span style={{ color: '#666' }}>Service Charge:</span>
//                     <span style={{ fontWeight: '500' }}>
//                       ₹{parseFloat(data?.invoice?.
//                         Service_Charge_Amount).toFixed(2)}
//                       {/* //₹{parseFloat(data?.invoice?.Service_Charge).toFixed(2)} */}
//                     </span>
//                     {/* <span style={{ fontWeight: '500' }}>
//                       ₹{parseFloat(data?.invoice?.Service_Charge).toFixed(2)}
//                     </span> */}
//                   </div>
//                 )}

//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   padding: '12px 0',
//                   fontSize: '18px',
//                   fontWeight: 'bold',
//                   borderTop: '2px solid #ff0000',
//                   marginTop: '8px'
//                 }}>
//                   <span>Total:</span>
//                   <span style={{ color: '#ff0000' }}>
//                     ₹{parseFloat(data?.invoice?.Amount).toFixed(2)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   })
//   // console.log(filteredInvoices)


//   // Status color

//   // console.log(filteredInvoices)
//   //   return (
//   //     <>

//   //       <div className="sb2-2-3">
//   //         {!isLoadingInvoicesAndOrdersInDateRange ?(<div className="row" style={{ margin: "0px" }}>
//   //           <div className="col-md-12">
//   //             <div style={{ padding: "20px" }} className="box-inn-sp">



//   // <div className="inn-title w-full">
//   //   <div className="
//   //       flex flex-col mt-4
//   //       lg:flex-row 
//   //       lg:items-center 
//   //       lg:justify-between 
//   //       gap-4
//   //     "
//   //   >
//   //     {/* LEFT + CENTER grouped for desktop */}
//   //     <div className="
//   //         flex flex-col 
//   //         items-center 
//   //         text-center 
//   //         gap-2 
//   //         flex-1
//   //         ml-56
//   //       "
//   //     >
//   //       {/* Title */}
//   //       <h3 className="text-lg font-semibold">DAILY REPORT</h3>

//   //       {/* Total invoices */}
//   //       <h4 className="text-uppercase mt-2 text-gray-700">
//   //         Total Invoices: {allInvoicesAndOrderInDateRange?.totalInvoices}
//   //       </h4>
//   //     </div>

//   //     {/* SEARCH (Desktop Right) */}
//   //     {/* <div className="hidden sm:block w-56">
//   //       <input
//   //         type="text"
//   //         placeholder="Search ..."
//   //         value={searchTerm}
//   //         onChange={(e) => setSearchTerm(e.target.value)}
//   //         className="w-full"
//   //       />
//   //     </div> */}
//   //      <div className="w-full lg:w-56">
//   //       <input
//   //         type="text"
//   //         placeholder="Search ..."
//   //         value={searchTerm}
//   //         onChange={(e) => setSearchTerm(e.target.value)}
//   //         className="w-full"
//   //       />
//   //     </div>

//   //     {/* SEARCH (Mobile full width) */}
//   //     {/* <div className="block sm:hidden w-full">
//   //       <input
//   //         type="text"
//   //         placeholder="Search ..."
//   //         value={searchTerm}
//   //         onChange={(e) => setSearchTerm(e.target.value)}
//   //         className="w-full"
//   //       />
//   //     </div> */}
//   //   </div>
//   // </div>


//   //               <div style={{ padding: "20px", backgroundColor: "#f1f1f19d" }} className="tab-inn">

//   //                 {/* INVOICE CARDS */}
//   //                  {dineInvoices?.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//   //                      <div className=" flex justify-center items-center">
//   //             <h4 className='text-2xl font-bold text-uppercase'>Table Invoices</h4>
//   //          </div>
//   //                   {dineInvoices?.map((data) => {
//   //                      const isExpanded = expandedInvoice === data.invoice.Invoice_Id;
//   //                     return (<div
//   //                       key={data.invoice.Invoice_Id}
//   //                       style={{
//   //                         backgroundColor: '#fff',
//   //                         borderRadius: '8px',
//   //                         boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//   //                         overflow: 'hidden',
//   //                         border: '1px solid #e0e0e0'
//   //                       }}
//   //                     >
//   //                       {/* INVOICE HEADER */}
//   //                       <div
//   //                         // onClick={() => toggleExpand(data.invoice.Invoice_Id)}
//   //                         style={{
//   //                           padding: '20px',
//   //                           cursor: 'pointer',
//   //                           backgroundColor: '#fafafa',
//   //                           borderBottom: '1px solid #e0e0e0',
//   //                           transition: 'background-color 0.2s'
//   //                         }}
//   //                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
//   //                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
//   //                       >
//   //                         <div className="grid grid-cols-3 grid-rows-2 sm:grid-cols-6 sm:grid-rows-1" style={{ margin: 0, alignItems: 'center' }}>

//   //                           {/* Invoice ID & Order ID */}
//   //                           <div className="" style={{ marginBottom: '10px' }}>
//   //                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//   //                               <FileText size={20} style={{ color: '#ff0000' }} />
//   //                               <div>
//   //                                 <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
//   //                                   {data.invoice.Invoice_Id}
//   //                                 </div>
//   //                                 {/* <div style={{ fontSize: '12px', color: '#666' }}>
//   //                                   Order: {data.invoice.Order_Id}
//   //                                 </div> */}
//   //                               </div>
//   //                             </div>
//   //                           </div>

//   //                           {/* Date */}
//   //                           <div className="" style={{ marginBottom: '10px' }}>
//   //                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//   //                               <Calendar size={18} style={{ color: '#666' }} />
//   //                               <div style={{ fontSize: '13px', color: '#666' }}>
//   //                                 {formatDate(data?.invoice?.Invoice_Date)}
//   //                               </div>
//   //                             </div>
//   //                           </div>

//   //                           {/* Status */}
//   //                           <div className="grid justify-items-end sm:justify-items-start" style={{ marginBottom: '10px' }}>
//   //                             <span
//   //                               style={{
//   //                                 backgroundColor: getStatusColor(data.order.Status),
//   //                                 color: '#fff',
//   //                                 padding: '6px 14px',
//   //                                 borderRadius: '20px',
//   //                                 fontSize: '12px',
//   //                                 fontWeight: 'bold',
//   //                                 textTransform: 'uppercase',
//   //                                 display: 'inline-block'
//   //                               }}
//   //                             >
//   //                               {data?.order?.Status}
//   //                             </span>
//   //                           </div>

//   //                           {/* Tables */}
//   //                             <div className="" style={{ marginBottom: '10px' }}>
//   //                                                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//   //                                                         <User size={18} style={{ color: '#666' }} />
//   //                                                         <div style={{ fontSize: '13px', color: '#666' }}>
//   //                                                           <span>{data?.invoice?.Customer_Name}</span>
//   //                                                           <span> - {data?.invoice?.Customer_Phone}</span>
//   //                                                         </div>
//   //                                                       </div>
//   //                               </div>
//   //                           <div className="" style={{ marginBottom: '10px' }}>
//   //                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//   //                               <Table2 size={18} style={{ color: '#666' }} />
//   //                               <div style={{ fontSize: '13px', color: '#666' }}>
//   //                                 {data?.tables?.map(t => t?.Table_Name).join(', ') || 'N/A'}
//   //                               </div>
//   //                             </div>
//   //                           </div>

//   //                           {/* Amount */}
//   //                           {/* <div className="" style={{ marginBottom: '10px' }}>
//   //                             <div style={{ textAlign: 'right' }}>
//   //                               <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0000' }}>
//   //                                 ₹{parseFloat(data?.invoice?.Amount).toFixed(2)}
//   //                               </div>
//   //                               <div style={{ fontSize: '12px', color: '#666' }}>
//   //                                 {data.items?.length || 0} items
//   //                               </div>
//   //                             </div>
//   //                           </div> */}
//   //                           {/* Icon */}
//   //                            {/* <div className="justify-items-end" style={{ marginBottom: '10px' }}>
//   //                             <div style={{ textAlign: 'right' }}>

//   //                               <ChevronDown onClick={() => toggleExpand(data?.invoice?.Invoice_Id)}/>
//   //                               {/* <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0000' }}>
//   //                                 ₹{parseFloat(data.invoice.Amount).toFixed(2)}
//   //                               </div>
//   //                               <div style={{ fontSize: '12px', color: '#666' }}>
//   //                                 {data.items?.length || 0} items
//   //                               </div> 
//   //                             </div>
//   //                           </div> */}
//   //                             <div className="flex justify-end gap-2" style={{ marginBottom: '10px' }}>
//   //                                                       <div style={{ textAlign: 'right' }}>
//   //                                                         <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0000' }}>
//   //                                                           ₹{parseFloat(data?.invoice?.Amount).toFixed(2)}
//   //                                                         </div>
//   //                                                         <div style={{ fontSize: '12px', color: '#666' }}>
//   //                                                           {data.items?.length || 0} items
//   //                                                         </div>
//   //                                                       </div>

//   //                             <div style={{ textAlign: 'right' }}>
//   //                                 {isExpanded ? (
//   //                                   <ChevronUp onClick={() => toggleExpand(data?.invoice?.Invoice_Id)} />
//   //                                 ) : (
//   //                                   <ChevronDown onClick={() => toggleExpand(data?.invoice?.Invoice_Id)} />
//   //                                 )}
//   //                             </div>

//   //                                                     </div>
//   //                         </div>
//   //                       </div>

//   //                       {/* EXPANDED DETAILS */}
//   //                       {expandedInvoice === data?.invoice?.Invoice_Id && (
//   //                         <div style={{ padding: '20px', backgroundColor: '#fff' }}>

//   //                           {/* Items Table */}
//   //                           <div style={{ marginBottom: '20px' }}>
//   //                             <h5 style={{ 
//   //                               fontSize: '16px', 
//   //                               fontWeight: 'bold', 
//   //                               marginBottom: '15px',
//   //                               display: 'flex',
//   //                               alignItems: 'center',
//   //                               gap: '8px'
//   //                             }}>
//   //                               <ShoppingCart size={18} style={{ color: '#ff0000' }} />
//   //                               Order Items
//   //                             </h5>

//   //                             <div style={{ overflowX: 'auto' }}>
//   //                               <table style={{ 
//   //                                 width: '100%', 
//   //                                 borderCollapse: 'collapse',
//   //                                 fontSize: '14px'
//   //                               }}>
//   //                                 <thead>
//   //                                   <tr style={{ backgroundColor: '#f5f5f5' }}>
//   //                                     <th style={{ padding: '12px', textAlign: 'left', 
//   //                                         borderBottom: '2px solid #ddd' }}>
//   //                                       Item Name
//   //                                     </th>
//   //                                     <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//   //                                       Quantity
//   //                                     </th>
//   //                                     <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
//   //                                       Price
//   //                                     </th>
//   //                                     <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
//   //                                       Amount
//   //                                     </th>
//   //                                   </tr>
//   //                                 </thead>
//   //                                 <tbody>
//   //                                   {data?.items?.map((item, idx) => (
//   //                                     <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
//   //                                       <td style={{ padding: '12px', fontWeight: '500' }}>
//   //                                         {item?.Item_Name}
//   //                                       </td>
//   //                                       <td style={{ padding: '12px', textAlign: 'center' }}>
//   //                                         {item?.Quantity}
//   //                                       </td>
//   //                                       <td style={{ padding: '12px', textAlign: 'right' }}>
//   //                                         ₹{parseFloat(item?.Price).toFixed(2)}
//   //                                       </td>
//   //                                       <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
//   //                                         ₹{parseFloat(item?.Amount).toFixed(2)}
//   //                                       </td>
//   //                                     </tr>
//   //                                   ))}
//   //                                 </tbody>
//   //                               </table>
//   //                             </div>
//   //                           </div>

//   //                           {/* Summary */}
//   //                           <div style={{ 
//   //                             display: 'flex', 
//   //                             justifyContent: 'flex-end',
//   //                             borderTop: '2px solid #e0e0e0',
//   //                             paddingTop: '15px'
//   //                           }}>
//   //                             <div style={{ minWidth: '300px' }}>
//   //                               <div style={{ 
//   //                                 display: 'flex', 
//   //                                 justifyContent: 'space-between',
//   //                                 padding: '8px 0',
//   //                                 fontSize: '14px'
//   //                               }}>
//   //                                 <span style={{ color: '#666' }}>Subtotal:</span>
//   //                                 <span style={{ fontWeight: '500' }}>
//   //                                   ₹{parseFloat(data?.invoice?.Sub_Total || data?.order?.Sub_Total).toFixed(2)}
//   //                                 </span>
//   //                               </div>

//   //                               {data?.invoice?.Discount && (
//   //                                 <div style={{ 
//   //                                   display: 'flex', 
//   //                                   justifyContent: 'space-between',
//   //                                   padding: '8px 0',
//   //                                   fontSize: '14px'
//   //                                 }}>
//   //                                   <span style={{ color: '#666' }}>Discount:</span>
//   //                                   {/* <span style={{ fontWeight: '500' }}>
//   //                                     ₹{parseFloat(data?.invoice?.Discount).toFixed(2)}
//   //                                   </span> */}
//   //                                   <span style={{ fontWeight: '500' }}>
//   //                                     {data?.invoice?.Discount_Type === 'percentage' ? 
//   //                                     `${data?.invoice?.Discount}%`  :
//   //                                      `₹${parseFloat(data?.invoice?.Discount).toFixed(2)} `}
//   //                                     {/* ₹{parseFloat(data?.invoice?.Discount).toFixed(2)} */}

//   //                                   </span>
//   //                                 </div>
//   //                               )}
//   //                                 {data?.invoice?.Service_Charge && (
//   //                                 <div style={{ 
//   //                                   display: 'flex', 
//   //                                   justifyContent: 'space-between',
//   //                                   padding: '8px 0',
//   //                                   fontSize: '14px'
//   //                                 }}>
//   //                                   <span style={{ color: '#666' }}>Service Charge:</span>
//   //                                   <span style={{ fontWeight: '500' }}>
//   //                                     ₹{parseFloat(data?.invoice?.Service_Charge).toFixed(2)}
//   //                                   </span>
//   //                                 </div>
//   //                               )}

//   //                               <div style={{ 
//   //                                 display: 'flex', 
//   //                                 justifyContent: 'space-between',
//   //                                 padding: '12px 0',
//   //                                 fontSize: '18px',
//   //                                 fontWeight: 'bold',
//   //                                 borderTop: '2px solid #ff0000',
//   //                                 marginTop: '8px'
//   //                               }}>
//   //                                 <span>Total:</span>
//   //                                 <span style={{ color: '#ff0000' }}>
//   //                                   ₹{parseFloat(data.invoice.Amount).toFixed(2)}
//   //                                 </span>
//   //                               </div>
//   //                             </div>
//   //                           </div>

//   //                           {/* Action Buttons */}
//   //                           <div style={{ 
//   //                             marginTop: '20px',
//   //                             display: 'flex',
//   //                             gap: '10px',
//   //                             justifyContent: 'flex-end'
//   //                           }}>
//   //                             {/* <button
//   //                               onClick={() => window.print()}
//   //                               style={{
//   //                                 padding: '10px 20px',
//   //                                 backgroundColor: '#fff',
//   //                                 color: '#ff0000',
//   //                                 border: '2px solid #ff0000',
//   //                                 borderRadius: '6px',
//   //                                 fontWeight: 'bold',
//   //                                 cursor: 'pointer'
//   //                               }}
//   //                             >
//   //                               Print Invoice
//   //                             </button> */}
//   //                             {/* <button
//   //                               onClick={() => window.location.href = `/invoice/${data.invoice.Invoice_Id}`}
//   //                               style={{
//   //                                 padding: '10px 20px',
//   //                                 backgroundColor: '#ff0000',
//   //                                 color: '#fff',
//   //                                 border: 'none',
//   //                                 borderRadius: '6px',
//   //                                 fontWeight: 'bold',
//   //                                 cursor: 'pointer'
//   //                               }}
//   //                             >
//   //                               View Details
//   //                             </button> */}
//   //                           </div>
//   //                         </div>
//   //                       )}
//   //                     </div>
//   //                   )})}

//   //                   {/* No Results */}
//   //                   {dineInvoices.length === 0 && (
//   //                     <div style={{
//   //                       textAlign: 'center',
//   //                       padding: '60px 20px',
//   //                       backgroundColor: '#fff',
//   //                       borderRadius: '8px'
//   //                     }}>
//   //                       <FileText size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
//   //                       <p style={{ fontSize: '16px', color: '#999' }}>No invoices found</p>
//   //                     </div>
//   //                   )}
//   //                 </div>}
//   //                <div className="border-b border-black-300 mt-2 mb-2"></div>
//   //                  {takeAwayInvoices?.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//   //                   <div className=" flex justify-center items-center">
//   //             <h4 className="text-2xl font-bold text-uppercase">Takeaway Invoices</h4>
//   //          </div>
//   //                   {takeAwayInvoices?.map((data) => {


//   //                     const isExpanded = expandedInvoice === data.invoice.Invoice_Id;
//   //                     return(<div
//   //                       key={data?.invoice?.Invoice_Id}
//   //                       style={{
//   //                         backgroundColor: '#fff',
//   //                         borderRadius: '8px',
//   //                         boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//   //                         overflow: 'hidden',
//   //                         border: '1px solid #e0e0e0'
//   //                       }}
//   //                     >
//   //                       {/* INVOICE HEADER */}
//   //                       <div

//   //                         style={{
//   //                           padding: '20px',
//   //                           cursor: 'pointer',
//   //                           backgroundColor: '#fafafa',
//   //                           borderBottom: '1px solid #e0e0e0',
//   //                           transition: 'background-color 0.2s'
//   //                         }}
//   //                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
//   //                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
//   //                       >
//   //                         <div className="grid grid-cols-3 grid-rows-2 sm:grid-cols-6 sm:grid-rows-1" style={{ margin: 0, alignItems: 'center' }}>

//   //                           {/* Invoice ID & Order ID */}
//   //                           <div className="" style={{ marginBottom: '10px' }}>
//   //                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//   //                               <FileText size={20} style={{ color: '#ff0000' }} />
//   //                               <div>
//   //                                 <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
//   //                                   {data?.invoice?.Invoice_Id}
//   //                                 </div>
//   //                                 {/* <div style={{ fontSize: '12px', color: '#666' }}>
//   //                                   Order: {data.invoice.Order_Id}
//   //                                 </div> */}
//   //                               </div>
//   //                             </div>
//   //                           </div>

//   //                           {/* Date */}
//   //                           <div className="" style={{ marginBottom: '10px' }}>
//   //                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//   //                               <Calendar size={18} style={{ color: '#666' }} />
//   //                               <div style={{ fontSize: '13px', color: '#666' }}>
//   //                                 {formatDate(data?.invoice?.Invoice_Date)}
//   //                               </div>
//   //                             </div>
//   //                           </div>

//   //                           {/* Status */}
//   //                            <div className="grid justify-items-end sm:justify-items-start" style={{ marginBottom: '10px' }}>
//   //                             <span
//   //                               style={{
//   //                                 backgroundColor: getStatusColor(data?.order?.Status),
//   //                                 color: '#fff',
//   //                                 padding: '6px 14px',
//   //                                 borderRadius: '20px',
//   //                                 fontSize: '12px',
//   //                                 fontWeight: 'bold',
//   //                                 textTransform: 'uppercase',
//   //                                 display: 'inline-block'
//   //                               }}
//   //                             >
//   //                               {data?.order?.Status}
//   //                             </span>
//   //                           </div>

//   //                           {/* Tables */}
//   //                              <div className="" style={{ marginBottom: '10px' }}>
//   //                                                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//   //                                                         <User size={18} style={{ color: '#666' }} />
//   //                                                         <div style={{ fontSize: '13px', color: '#666' }}>
//   //                                                           <span>{data?.invoice?.Customer_Name}</span>
//   //                                                           <span> - {data?.invoice?.Customer_Phone}</span>
//   //                                                         </div>
//   //                                                       </div>
//   //                                                     </div>
//   //                           <div className="" style={{ marginBottom: '10px' }}>
//   //                             {/* <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//   //                               <Table2 size={18} style={{ color: '#666' }} />
//   //                               <div style={{ fontSize: '13px', color: '#666' }}>
//   //                                 {data.tables?.map(t => t.Table_Name).join(', ') || 'N/A'}
//   //                               </div>
//   //                             </div> */}
//   //                           </div>

//   //                            <div className="flex justify-end gap-2"  style={{ marginBottom: '10px' }}>
//   //                             <div style={{ textAlign: 'right' }}>
//   //                               <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0000' }}>
//   //                                 ₹{parseFloat(data?.invoice?.Amount).toFixed(2)}
//   //                               </div>
//   //                               <div style={{ fontSize: '12px', color: '#666' }}>
//   //                                 {data.items?.length || 0} items
//   //                               </div>
//   //                             </div>

//   //                                <div style={{ textAlign: 'right' }}>


//   //       {isExpanded ? (
//   //         <ChevronUp onClick={() => toggleExpand(data?.invoice?.Invoice_Id)} />
//   //       ) : (
//   //         <ChevronDown onClick={() => toggleExpand(data?.invoice?.Invoice_Id)} />
//   //       )}


//   //                               </div>

//   //                           </div>
//   //                            {/* Icon */}

//   //                         </div>
//   //                       </div>

//   //                       {/* EXPANDED DETAILS */}
//   //                       {expandedInvoice === data.invoice.Invoice_Id && (
//   //                         <div style={{ padding: '20px', backgroundColor: '#fff' }}>

//   //                           {/* Items Table */}
//   //                           <div style={{ marginBottom: '20px' }}>
//   //                             <h5 style={{ 
//   //                               fontSize: '16px', 
//   //                               fontWeight: 'bold', 
//   //                               marginBottom: '15px',
//   //                               display: 'flex',
//   //                               alignItems: 'center',
//   //                               gap: '8px'
//   //                             }}>
//   //                               <ShoppingCart size={18} style={{ color: '#ff0000' }} />
//   //                               Order Items
//   //                             </h5>

//   //                             <div style={{ overflowX: 'auto' }}>
//   //                               <table style={{ 
//   //                                 width: '100%', 
//   //                                 borderCollapse: 'collapse',
//   //                                 fontSize: '14px'
//   //                               }}>
//   //                                 <thead>
//   //                                   <tr style={{ backgroundColor: '#f5f5f5' }}>
//   //                                     <th style={{ padding: '12px', textAlign: 'left', 
//   //                                         borderBottom: '2px solid #ddd' }}>
//   //                                       Item Name
//   //                                     </th>
//   //                                     <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//   //                                       Quantity
//   //                                     </th>
//   //                                     <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
//   //                                       Price
//   //                                     </th>
//   //                                     <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
//   //                                       Amount
//   //                                     </th>
//   //                                   </tr>
//   //                                 </thead>
//   //                                 <tbody>
//   //                                   {data.items?.map((item, idx) => (
//   //                                     <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
//   //                                       <td style={{ padding: '12px', fontWeight: '500' }}>
//   //                                         {item?.Item_Name}
//   //                                       </td>
//   //                                       <td style={{ padding: '12px', textAlign: 'center' }}>
//   //                                         {item?.Quantity}
//   //                                       </td>
//   //                                       <td style={{ padding: '12px', textAlign: 'right' }}>
//   //                                         ₹{parseFloat(item?.Price).toFixed(2)}
//   //                                       </td>
//   //                                       <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
//   //                                         ₹{parseFloat(item?.Amount).toFixed(2)}
//   //                                       </td>
//   //                                     </tr>
//   //                                   ))}
//   //                                 </tbody>
//   //                               </table>
//   //                             </div>
//   //                           </div>

//   //                           {/* Summary */}
//   //                           <div style={{ 
//   //                             display: 'flex', 
//   //                             justifyContent: 'flex-end',
//   //                             borderTop: '2px solid #e0e0e0',
//   //                             paddingTop: '15px'
//   //                           }}>
//   //                             <div style={{ minWidth: '300px' }}>
//   //                               <div style={{ 
//   //                                 display: 'flex', 
//   //                                 justifyContent: 'space-between',
//   //                                 padding: '8px 0',
//   //                                 fontSize: '14px'
//   //                               }}>
//   //                                 <span style={{ color: '#666' }}>Subtotal:</span>
//   //                                 <span style={{ fontWeight: '500' }}>
//   //                                   ₹{parseFloat(data?.invoice?.Sub_Total || data?.order?.Sub_Total).toFixed(2)}
//   //                                 </span>
//   //                               </div>

//   //                               {data?.invoice?.Discount && (
//   //                                 <div style={{ 
//   //                                   display: 'flex', 
//   //                                   justifyContent: 'space-between',
//   //                                   padding: '8px 0',
//   //                                   fontSize: '14px'
//   //                                 }}>
//   //                                   <span style={{ color: '#666' }}>Discount:</span>
//   //                                   {/* <span style={{ fontWeight: '500' }}>
//   //                                     ₹{parseFloat(data?.invoice?.Discount).toFixed(2)}
//   //                                   </span> */}
//   //                                     <span style={{ fontWeight: '500' }}>
//   //                                     {data?.invoice?.Discount_Type === 'percentage' ? 
//   //                                     `${data?.invoice?.Discount}%`  :
//   //                                      `₹${parseFloat(data?.invoice?.Discount).toFixed(2)} `}
//   //                                     {/* ₹{parseFloat(data?.invoice?.Discount).toFixed(2)} */}

//   //                                   </span>
//   //                                 </div>
//   //                               )}
//   //                                 {data?.invoice?.Service_Charge && (
//   //                                 <div style={{ 
//   //                                   display: 'flex', 
//   //                                   justifyContent: 'space-between',
//   //                                   padding: '8px 0',
//   //                                   fontSize: '14px'
//   //                                 }}>
//   //                                   <span style={{ color: '#666' }}>Service Charge:</span>
//   //                                   <span style={{ fontWeight: '500' }}>
//   //                                     ₹{parseFloat(data?.invoice?.Service_Charge).toFixed(2)}
//   //                                   </span>
//   //                                 </div>
//   //                               )}

//   //                               <div style={{ 
//   //                                 display: 'flex', 
//   //                                 justifyContent: 'space-between',
//   //                                 padding: '12px 0',
//   //                                 fontSize: '18px',
//   //                                 fontWeight: 'bold',
//   //                                 borderTop: '2px solid #ff0000',
//   //                                 marginTop: '8px'
//   //                               }}>
//   //                                 <span>Total:</span>
//   //                                 <span style={{ color: '#ff0000' }}>
//   //                                   ₹{parseFloat(data.invoice.Amount).toFixed(2)}
//   //                                 </span>
//   //                               </div>
//   //                             </div>
//   //                           </div>

//   //                           {/* Action Buttons */}
//   //                           <div style={{ 
//   //                             marginTop: '20px',
//   //                             display: 'flex',
//   //                             gap: '10px',
//   //                             justifyContent: 'flex-end'
//   //                           }}>

//   //                           </div>
//   //                         </div>
//   //                       )}
//   //                     </div>
//   //                   )})}

//   //                   {/* No Results */}
//   //                   {takeAwayInvoices?.length === 0 && (
//   //                     <div style={{
//   //                       textAlign: 'center',
//   //                       padding: '60px 20px',
//   //                       backgroundColor: '#fff',
//   //                       borderRadius: '8px'
//   //                     }}>
//   //                       <FileText size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
//   //                       <p style={{ fontSize: '16px', color: '#999' }}>No invoices found</p>
//   //                     </div>
//   //                   )}
//   //                 </div>}
//   //                   <div className="flex justify-center align-center space-x-2 p-4">
//   //                                 <button type="button"
//   //                                     onClick={() => handlePreviousPage()}
//   //                                     disabled={page === 1}
//   //                                     className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
//   //                 ${page === 1 ? 'opacity-50 ' : ''}
//   //                 `}
//   //                                 >
//   //                                     ← Previous
//   //                                 </button>
//   //                                 {[...Array(allInvoicesAndOrderInDateRange?.totalPages).keys()].map((index) => (
//   //                                     <button
//   //                                         key={index}
//   //                                         onClick={() => handlePageChange(index + 1)}
//   //                                         // className={
//   //                                         //     `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 
//   //                                         //         'bg-gray-200 hover:bg-gray-300'
//   //                                         //     }`}
//   //                                         className={
//   //                                             `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#ff0000] text-white' :
//   //                                                 'bg-gray-200 hover:bg-gray-300'
//   //                                             }`}
//   //                                     >
//   //                                         {index + 1}
//   //                                     </button>
//   //                                 ))}

//   //                                 <button type="button"
//   //                                     onClick={() => handleNextPage()}
//   //                                     disabled={page === allInvoicesAndOrderInDateRange?.totalPages || allInvoicesAndOrderInDateRange?.totalPages === 0}
//   //                                     className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
//   //                 ${page === allInvoicesAndOrderInDateRange?.totalPages || allInvoicesAndOrderInDateRange?.totalPages === 0 ? 'opacity-50 ' : ''}
//   //                 `}
//   //                                 >
//   //                                     Next →
//   //                                 </button>
//   //                             </div>
//   //               </div>

//   //             </div>
//   //           </div>
//   //         </div>):(
//   //           <div className="flex justify-center align-center">
//   //             <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
//   //           </div>
//   //         )}
//   //       </div>
//   //     </>
//   //   );
//   return (
//     <>
//       {/* <div className="sb2-2-2">
//         <ul>
//           <li>
//             <a style={{ display: "flex", flexDirection: "row" }} href="/home">
//               <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
//               Dashboard
//             </a>
//           </li>
//         </ul>
//       </div> */}

//       <div className="sb2-2-3">
//         <div className="row" style={{ margin: "0px" }}>
//           <div className="col-md-12">
//             <div style={{ padding: "20px" }} className="box-inn-sp">



//               <div className="inn-title w-full">
//                 <div className="
//       flex flex-col
//       lg:flex-row 
//       lg:items-center 
//       lg:justify-between 
//       gap-4
//     "
//                 >
//                   {/* LEFT + CENTER grouped for desktop */}
//                   <div className="
//         flex flex-col 
//         items-center 
//         text-center 
//         gap-2 
//         flex-1
//         sm:ml-56
//       "
//                   >
//                     {/* Title */}
//                     <h3 className="text-lg font-semibold">DATE RANGE REPORT</h3>

//                     {/* Total invoices */}
//                     <h4 className="text-uppercase mt-2 text-gray-700">
//                       Total Invoices: {allInvoicesAndOrderInDateRange?.totalCount}
//                     </h4>
//                   </div>

//                   {/* SEARCH (Desktop Right) */}
//                   {/* <div className="hidden sm:block w-56">
//       <input
//         type="text"
//         placeholder="Search ..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full"
//       />
//     </div> */}
//                   <div className="w-full lg:w-56">
//                     <input
//                       type="text"
//                       placeholder="Search ..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="w-full"
//                     />
//                   </div>

//                   {/* SEARCH (Mobile full width) */}
//                   {/* <div className="block sm:hidden w-full">
//       <input
//         type="text"
//         placeholder="Search ..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full"
//       />
//     </div> */}
//                 </div>
//               </div>


//               {!isLoadingInvoicesAndOrdersInDateRange ? <div style={{ padding: "20px", backgroundColor: "#f1f1f19d" }} className="tab-inn">
//                 {/* <div>
//                     <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Invoices</h4>
//                     </div>
//                     <div className='flex justify-center align-center'>
//                     <h4 >
//                       Total Invoices: {filteredInvoices.length}
//                     </h4>
//                     </div> */}

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//                   {/* LEFT COLUMN - DINE IN INVOICES */}

//                   {/* <div>
//                     <div className="flex justify-center items-center mb-4">
//                       <h4 className="text-2xl font-bold uppercase">Dine-In Invoices</h4>
//                     </div>
//                     {dineInvoices?.length > 0 && (<div>
//                       {dineInvoices?.map((data) => (
//                         <InvoiceCard key={data.invoice.Invoice_Id} data={data} />
//                       ))}

//                     </div>
//                     )}
//                     {dineInvoices?.length === 0 && (
//                       <div style={{
//                         textAlign: 'center',
//                         padding: '60px 20px',
//                         backgroundColor: '#fff',
//                         borderRadius: '8px',

//                       }} className='flex justify-center items-center'>
//                         <FileText size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
//                         <p style={{ fontSize: '16px', color: '#999' }}>No table invoices found</p>
//                       </div>
//                     )}
//                   </div> */}
//                   {/* LEFT COLUMN - DINE IN INVOICES */}
//                   <div>
//                     <div className="flex justify-center items-center mb-4">
//                       <h4 className="text-2xl font-bold uppercase">
//                         Dine-In Invoices
//                       </h4>
//                     </div>

//                     {(isLoadingInvoicesAndOrdersInDateRange || isFetchingAllInvoicesAndOrderInDateRange) ? (

//                       /* 🔥 LOADING */
//                       <div>
//                         {[...Array(5)].map((_, i) => (
//                           <InvoiceSkeleton key={i} />
//                         ))}
//                       </div>

//                     ) : dineInvoices?.length > 0 ? (

//                       /* 🔥 DATA EXISTS */
//                       <div>
//                         {dineInvoices.map((data) => (
//                           <InvoiceCard
//                             key={data.invoice.Invoice_Id}
//                             data={data}
//                           />
//                         ))}
//                       </div>

//                     ) : (

//                       /* 🔥 EMPTY STATE */
//                       <div
//                         style={{
//                           textAlign: "center",
//                           padding: "60px 20px",
//                           backgroundColor: "#fff",
//                           borderRadius: "8px",
//                         }}
//                         className="flex justify-center items-center"
//                       >
//                         <FileText
//                           size={48}
//                           style={{ color: "#ccc", marginBottom: "16px" }}
//                         />
//                         <p style={{ fontSize: "16px", color: "#999" }}>
//                           No table invoices found
//                         </p>
//                       </div>

//                     )}
//                   </div>


//                   {/* RIGHT COLUMN - TAKEAWAY INVOICES */}
//                   {/* RIGHT COLUMN - TAKEAWAY INVOICES */}
//                   <div>
//                     <div className="flex justify-center items-center mb-4">
//                       <h4 className="text-2xl font-bold uppercase">
//                         Takeaway Invoices
//                       </h4>
//                     </div>

//                     {(isLoadingInvoicesAndOrdersInDateRange || isFetchingAllInvoicesAndOrderInDateRange) ? (

//                       /* 🔥 LOADING */
//                       <div>
//                         {[...Array(5)].map((_, i) => (
//                           <InvoiceSkeleton key={i} />
//                         ))}
//                       </div>

//                     ) : takeAwayInvoices?.length > 0 ? (

//                       /* 🔥 DATA EXISTS */
//                       <div>
//                         {takeAwayInvoices.map((data) => (
//                           <InvoiceCard
//                             key={data.invoice.Invoice_Id}
//                             data={data}
//                           />
//                         ))}
//                       </div>

//                     ) : (

//                       /* 🔥 EMPTY STATE */
//                       <div
//                         style={{
//                           textAlign: "center",
//                           padding: "60px 20px",
//                           backgroundColor: "#fff",
//                           borderRadius: "8px",
//                         }}
//                         className="flex justify-center items-center"
//                       >
//                         <FileText
//                           size={48}
//                           style={{ color: "#ccc", marginBottom: "16px" }}
//                         />
//                         <p style={{ fontSize: "16px", color: "#999" }}>
//                           No takeaway invoices found
//                         </p>
//                       </div>

//                     )}
//                   </div>

//                   {/* <div>
//                     <div className="flex justify-center items-center mb-4">
//                       <h4 className="text-2xl font-bold uppercase">Takeaway Invoices</h4>
//                     </div>
//                     {takeAwayInvoices?.length > 0 && (<div>
//                       {takeAwayInvoices?.map((data) => (
//                         <InvoiceCard key={data.invoice.Invoice_Id} data={data} />
//                       ))}
//                     </div>
//                     )}
//                     {takeAwayInvoices?.length === 0 && (
//                       <div style={{
//                         textAlign: 'center',
//                         padding: '60px 20px',
//                         backgroundColor: '#fff',
//                         borderRadius: '8px',

//                       }} className='flex justify-center items-center'>
//                         <FileText size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
//                         <p style={{ fontSize: '16px', color: '#999' }}>No takeaway invoices found</p>
//                       </div>
//                     )}
//                   </div> */}

//                 </div>
//                 {/* <div className="flex justify-center align-center space-x-2 p-4">
//                   <button type="button"

//                     onClick={() => handlePreviousPage()}
//                     disabled={page === 1}
//                     className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
//                 ${page === 1 ? 'opacity-50 ' : ''}
//                 `}
//                   >
//                     ← Previous
//                   </button>
//                   {[...Array(allInvoicesAndOrderInDateRange?.totalPages).keys()].map((index) => (
//                     <button
//                       key={index}
//                       onClick={() => handlePageChange(index + 1)}
//                       // className={
//                       //     `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 
//                       //         'bg-gray-200 hover:bg-gray-300'
//                       //     }`}
//                       //style={{ backgroundColor: page === index + 1 ? '#ff0000' : '', color: page === index + 1 ? 'white' : '' }}
//                       className={
//                         `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#ff0000] text-white' :
//                           'bg-gray-200 hover:bg-gray-300'
//                         }`}
//                     >
//                       {index + 1}
//                     </button>
//                   ))}

//                   <button type="button"
//                     onClick={() => handleNextPage()}
//                     disabled={page === allInvoicesAndOrderInDateRange?.totalPages || allInvoicesAndOrderInDateRange?.totalPages === 0}
//                     className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
//                 ${page === allInvoicesAndOrderInDateRange?.totalPages || allInvoicesAndOrderInDateRange?.totalPages === 0 ? 'opacity-50 ' : ''}
//                 `}
//                   >
//                     Next →
//                   </button>
//                 </div> */}

//                 <div className="flex justify-center align-center p-4">
//                   <div className="flex items-center space-x-2 flex-wrap justify-center">

//                     {/* PREVIOUS */}
//                     <button
//                       type="button"
//                       onClick={() => handlePreviousPage()}
//                       disabled={page === 1}
//                       className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
//         ${page === 1 ? 'opacity-50 ' : ''}
//       `}
//                     >
//                       ← Previous
//                     </button>

//                     {/* PAGE NUMBERS — HIDDEN ON SMALL SCREENS */}
//                     <div style={{ marginRight: "0px" }}
//                       className="hidden sm:flex space-x-2">
//                       {/* {[...Array(allInvoicesAndOrderInDateRange?.totalPages).keys()].map((index) => (
//         <button
//           key={index}
//           onClick={() => handlePageChange(index + 1)}
//           className={
//             `px-3 py-1 rounded ${
//               page === index + 1
//                 ? 'bg-[#ff0000] text-white'
//                 : 'bg-gray-200 hover:bg-gray-300'
//             }`
//           }
//         >
//           {index + 1}
//         </button>
//       ))} */}
//                       {(() => {
//                         const totalPages = allInvoicesAndOrderInDateRange?.totalPages || 1;
//                         const maxVisible = 5; // how many pages around current
//                         const pages = [];

//                         let start = Math.max(1, page - 2);
//                         let end = Math.min(totalPages, page + 2);

//                         // Adjust if near start
//                         if (page <= 3) {
//                           end = Math.min(totalPages, maxVisible);
//                         }

//                         // Adjust if near end
//                         if (page > totalPages - 3) {
//                           start = Math.max(1, totalPages - maxVisible + 1);
//                         }

//                         // First page + dots
//                         if (start > 1) {
//                           pages.push(
//                             <button
//                               key={1}
//                               onClick={() => handlePageChange(1)}
//                               className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
//                             >
//                               1
//                             </button>
//                           );

//                           if (start > 2) {
//                             pages.push(
//                               <span key="start-dots" className="px-2">...</span>
//                             );
//                           }
//                         }

//                         // Middle pages
//                         for (let i = start; i <= end; i++) {
//                           pages.push(
//                             <button
//                               key={i}
//                               onClick={() => handlePageChange(i)}
//                               className={`px-3 py-1 rounded ${page === i
//                                 ? 'bg-[#ff0000] text-white'
//                                 : 'bg-gray-200 hover:bg-gray-300'
//                                 }`}
//                             >
//                               {i}
//                             </button>
//                           );
//                         }

//                         // Last page + dots
//                         if (end < totalPages) {
//                           if (end < totalPages - 1) {
//                             pages.push(
//                               <span key="end-dots" className="px-2">...</span>
//                             );
//                           }

//                           pages.push(
//                             <button
//                               key={totalPages}
//                               onClick={() => handlePageChange(totalPages)}
//                               className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
//                             >
//                               {totalPages}
//                             </button>
//                           );
//                         }

//                         return pages;
//                       })()}

//                     </div>

//                     {/* CURRENT PAGE — ONLY ON SMALL SCREENS */}
//                     <div className="sm:hidden px-3 py-1 bg-gray-100 rounded text-sm">
//                       Page {page} / {allInvoicesAndOrderInDateRange?.totalPages || 1}
//                     </div>

//                     {/* NEXT */}
//                     <button
//                       type="button"
//                       onClick={() => handleNextPage()}
//                       disabled={
//                         page === allInvoicesAndOrderInDateRange?.totalPages ||
//                         allInvoicesAndOrderInDateRange?.totalPages === 0
//                       }
//                       className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
//         ${page === allInvoicesAndOrderInDateRange?.totalPages ||
//                           allInvoicesAndOrderInDateRange?.totalPages === 0
//                           ? 'opacity-50 '
//                           : ''
//                         }
//       `}
//                     >
//                       Next →
//                     </button>

//                   </div>
//                 </div>

//               </div> : (

//                 <div className='flex justify-center align-center'>
//                   <h4 >
//                     <Spinner />
//                   </h4>
//                 </div>
//               )}

//             </div>
//           </div>
//         </div>
//       </div>
//       {showDeleteConfirmation && (
//         <DeleteFoodItemModal
//           title="Are you sure you want to delete Invoice?"
//           description={`Invoice #${selectedInvoice.Invoice_Number} will be deleted`}
//           onClose={() => setShowDeleteConfirmation(false)}
//           onConfirm={handleInvoiceDelete}
//           isLoading={isInvoiceDeleting}
//         />
//       )}
//     </>
//   );
// }

export default function AllOrdersTakeawayDateRange() {
  // const InvoiceSkeleton = () => {
  //   return (
  //     <div className="bg-white rounded-lg p-4 mb-3 shadow-sm animate-pulse">
  //       <div className="flex justify-between items-center mb-3">
  //         <div className="h-4 bg-gray-200 rounded w-1/4" />
  //         <div className="h-4 bg-gray-200 rounded w-16" />
  //       </div>
  //       <div>
  //       <div className="space-y-2">
  //         <div className="h-3 bg-gray-200 rounded w-1/2" />
  //         {/* <div className="h-3 bg-gray-200 rounded w-1/3" /> */}
  //         {/* <div className="h-3 bg-gray-200 rounded w-2/3" /> */}
  //       </div>
  //       </div>
  //     </div>
  //       //    <div className="p-4 bg-gray-100">
  //       // <div className="flex   justify-between gap-3">
          
  //       //   {/* PRE ORDER / TITLE */}
  //       //   <div className="h-5 w-32 bg-gray-300 rounded" />

  //       //   {/* BUTTONS */}
  //       //   <div className="flex gap-2 justify-end">
  //       //     <div className="h-6 w-16 bg-gray-300 rounded" />
  //       //     <div className="h-6 w-20 bg-gray-300 rounded" />
  //       //     <div className="h-6 w-20 bg-gray-300 rounded" />
  //       //   </div>
  //       // </div>
  //       // </div>
  //   );
  // };
  const InvoiceSkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-4 mb-3 shadow-sm animate-pulse">

      {/* TOP ROW */}
      {/* <div className="flex justify-between items-center mb-3">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div> */}

      {/* CONTENT */}
      <div className="flex flex-col 
          sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">

        {/* LEFT CONTENT */}
        <div className="space-y-2 w-full">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          {/* <div className="h-3 bg-gray-200 rounded w-1/3" /> */}
        </div>

        {/* RIGHT SIDE (AMOUNT + BUTTONS) */}
        <div className="flex flex-col items-end gap-2 ml-4">

          
         

          {/* 3 BUTTONS BELOW */}
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-16 bg-gray-300 rounded" />
            <div className="h-6 w-16 bg-gray-300 rounded" />
            <div className="h-6 w-16 bg-gray-300 rounded" />
          </div>
          {/* Amount */}
          <div className='flex gap-2'>

        
           <div className="h-4 bg-gray-300 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-10" />
            </div>
        </div>
      </div>

      {/* EXPANDED SECTION (STATIC, NO SHIMMER) */}
      

    </div>
  );
};
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [page, setPage] = useState(1);
  const { fromDate, toDate } = useParams();
  //   const {date}=useParams();
  console.log(fromDate, toDate);
  const [updateTakeawayAndDineInDeliveryStatus] = useUpdateTakeawayAndDineInDeliveryStatusMutation();
  const { data: userMe } = useGetUserQuery();
  console.log(userMe, "userMe")
  // const dispatch=useDispatch()
  // Format date
  const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'dine',     label: 'Dine-In' },
  { key: 'takeaway', label: 'Takeaway' },
];
  const [activeFilter,    setActiveFilter]    = useState('all');
  const getFilterLabel = () => {
  switch (activeFilter) {
    case "dine":
      return "Total Dine-In Invoices";
    case "takeaway":
      return "Total Takeaway Invoices";
    default:
      return "Total Invoices";
  }
};
  const { data: allInvoicesAndOrderInDateRange,
    isLoading: isLoadingInvoicesAndOrdersInDateRange,
    isFetching: isFetchingAllInvoicesAndOrderInDateRange

  } = useGetAllInvoicesOfOrdersAndTakeawaysInDateRangeQuery({
    fromDate, toDate, page,
    search: debouncedSearch,
    filter: activeFilter,   
  });
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  }
  const handleNextPage = () => {
    setPage(page + 1);
  }
  const handlePreviousPage = () => {
    setPage(page - 1);
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400); // 400ms is perfect for POS

    return () => clearTimeout(timer);
  }, [searchTerm]);


  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [deleteInvoice, { isLoading: isInvoiceDeleting }] = useDeleteInvoiceMutation();
  // Filter invoices
  //const invoiceData=allInvoicesAndOrderInDateRange?.data??[]
  //  console.log(allInvoicesAndOrderInDateRange,invoiceData);

  //   const filteredInvoices = invoiceData.filter(data =>
  //     data.invoice.Invoice_Id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     data.invoice.Order_Id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     data.items?.some(item => item.Item_Name?.toLowerCase().includes(searchTerm.toLowerCase()))
  //   );

  //   const dineInvoices=filteredInvoices.filter(invoice=>invoice.invoice.orderType==="dine")
  //   const takeAwayInvoices=filteredInvoices.filter(invoice=>invoice.invoice.orderType==="takeaway")
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      case 'completed': return '#4CAF50';
      default: return '#9e9e9e';
    }
  };
  const invoiceData = allInvoicesAndOrderInDateRange?.data ?? [];
  console.log(invoiceData);
  // const dineInvoices = invoiceData?.filter(
  //   inv => inv?.invoice.orderType === "dine"
  // );

  // const takeAwayInvoices = invoiceData.filter(
  //   inv => inv.invoice.orderType === "takeaway" || inv.invoice.orderType === "pre-book"
  // );
  /* ================= DINE-IN ================= */
  // const dineInvoices = invoiceData.filter(inv => {
  //   // normal dine
  //   if (inv.originalOrderType !== "pre-book" && inv.orderType === "dine") {
  //     return true;
  //   }

  //   // pre-book with tables
  //   if (inv.originalOrderType === "pre-book" && inv.tables?.length > 0) {
  //     return true;
  //   }

  //   return false;
  // });

  /* ================= TAKEAWAY ================= */
  // const takeAwayInvoices = invoiceData.filter(inv => {
  //   // normal takeaway
  //   if (inv.originalOrderType !== "pre-book" && inv.orderType === "takeaway") {
  //     return true;
  //   }

  //   // pre-book without tables
  //   if (inv.originalOrderType === "pre-book" && (!inv.tables || inv.tables.length === 0)) {
  //     return true;
  //   }

  //   return false;
  // });

  console.log(allInvoicesAndOrderInDateRange, "allInvoicesAndOrderInDateRange");
  //console.log(dineInvoices, takeAwayInvoices, "dineInvoices", "takeAwayInvoices");
  // Toggle expand/collapse

  const toggleExpand = (invoiceId) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  };
  const printKOTInvoice = (kitchens, orderType, tables) => {
    console.log(kitchens, "kitchens");
    const getCurrentDate = () =>
      new Date().toLocaleDateString("en-GB");

    const getCurrentTime = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    const tableNames =
      orderType === "dine" && Array.isArray(tables)
        ? tables.map(t => t.Table_Name).join(", ")
        : "";

    //   const kitchenSections = kitchens
    //     .map((kitchen, index) => `
    //   ${index > 0 ? `<div class="line"></div>` : ``}

    //   <div class="invoice-kitchen">
    //     <div class="header-center">
    //       ${orderType == "takeaway" ?
    //         `<div class="brand">TAKEAWAY</div>` :
    //         `<div class="brand">DINE-IN</div>`
    //       }
    //           ${orderType === "dine" && tableNames
    //         ? `<div style="font-size:16px;font-weight:800">TABLE: ${tableNames}</div>`
    //         : ``
    //       }
    //       <div class="brand">${kitchen.name}</div>
    //     </div>

    //     <div class="info-row date-time">
    //       <span><b>Date:</b> ${getCurrentDate()}</span>
    //       <span><b>Time:</b> ${getCurrentTime()}</span>
    //     </div>

    //     <div class="line-solid"></div>

    //     <div class="items-header">
    //       <div class="col-no">No</div>
    //       <div class="item-name">ITEM</div>
    //       <div class="item-qty">QTY</div>
    //     </div>

    //     ${kitchen.items.map((it, i) => `
    //       <div class="item-row">
    //         <div class="col-no">${i + 1}</div>
    //         <div class="item-name">${it.Item_Name}</div>
    //         <div class="item-qty">${it.Quantity ?? it.Item_Quantity}</div>
    //       </div>
    //     `).join("")}
    //   </div>
    // `)
    //     .join("");
    const kitchenSections = Object.entries(kitchens)
      .map(([kitchenName, items], index) => `
      ${index > 0 ? `<div class="line"></div>` : ``}

      <div class="invoice-kitchen">
        
             <div class="header-center">
        ${orderType == "takeaway" ?
          `<div class="brand">TAKEAWAY</div>` :
          `<div class="brand">DINE-IN</div>`
        }
           ${orderType === "dine" && tableNames
          ? `<div style="font-size:16px;font-weight:800">TABLE: ${tableNames}</div>`
          : ``
        }
        <div class="brand">${kitchenName}</div>
      </div>

        <div class="info-row date-time">
          <span><b>Date:</b> ${getCurrentDate()}</span>
          <span><b>Time:</b> ${getCurrentTime()}</span>
        </div>

        <div class="line-solid"></div>

        <div class="items-header">
          <div class="col-no">No</div>
          <div class="item-name">ITEM</div>
          <div class="item-qty">QTY</div>
        </div>

        ${items.map((it, i) => `
          <div class="item-row">
            <div class="col-no">${i + 1}</div>
            <div class="item-name">${it.Item_Name}</div>
            <div class="item-qty">${it.Item_Quantity}</div>
          </div>
        `).join("")}
      </div>
    `)
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body {
    font-family: 'Courier New', monospace;
    font-size: 16px;
    font-weight: 700;
    width: 58mm;
    margin: 0;
  }
  .invoice { width: 48mm; padding: 2mm; }
  .invoice-kitchen { margin-top: 8px; }
  .header-center {
    text-align: center;
    border-bottom: 1px dashed #000;
    margin-bottom: 6px;
    padding-bottom: 6px;
  }
  .brand { font-size: 20px; font-weight: 800; }
  .line { border-top: 1px dashed #000; margin: 6px 0; }
  .line-solid { border-top: 1px solid #000; margin: 5px 0; }
  .items-header, .item-row {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
  }
  .items-header { border-bottom: 1px solid #000; font-weight: 800; gap: 4px; padding-bottom: 4px; }
  .col-no { width: 5mm; }
  .item-name { flex: 1; }
  .item-qty { width: 6mm; text-align: center; }
  .info-row.date-time {
    display: flex;
    
    justify-content: space-between;
    font-size: 12px;
  }
  
  @page { size: 48mm auto; margin: 0; }
            /* PRINT STYLES */
          @media print {
            body {
              width: 58mm;
              margin: 0;
              padding: 0;
            }
            
            .invoice {
              width: 58mm;
              padding: 8px;
            }
            
            @page {
              size: 58mm auto;
              margin: 0;
            }
            
            .no-print {
              display: none !important;
            }
          }
</style>
</head>
<body>
  <div class="invoice">
    ${kitchenSections}
  </div>
</body>
</html>`;
    // const win = window.open(
    //   "",
    //   "_blank",
    //   `width=${screen.width},height=${screen.height},left=0,top=0`
    // );
    // const win = window.open(
    //   "",
    //   "_blank",
    //   "width=800,height=600,left=0,top=0"
    // );
    // if (!win) return;

    // win.document.open();
    // win.document.write(html);
    // win.document.close();

    // win.onload = () => {
    //   setTimeout(() => {
    //     win.focus();
    //     win.print();
    //     win.close();
    //   }, 300);
    // };


    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();

    iframe.onload = () => {
      iframe.contentWindow.print();
    };

    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
  const printBillInvoice = (data) => {
    if (!data) return;

    const { invoice, order, items = [], tables = [], orderType } = data;
    console.log(data, "datainvoice");
    const getCurrentDate = () =>
      new Date().toLocaleDateString("en-GB");

    const getCurrentTime = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    const tableNames =
      orderType === "dine" && tables.length
        ? tables.map(t => t.Table_Name).join(", ")
        : "TAKEAWAY";

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${invoice.Invoice_Id}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    font-weight: 700;
    width: 58mm;
  
      margin: 0;
      padding: 0;
  }

  .invoice { width: 48mm; padding: 2mm; margin: 0 auto; }

  .header-center {
    text-align: center;
    border-bottom: 1px dashed #000;
    padding-bottom: 6px;
    margin-bottom: 6px;
  }

  .brand { font-size: 15px; font-weight: 900; }

  .line { border-top: 1px dashed #000; margin: 5px 0; }
  .line-solid { border-top: 1px solid #000; margin: 5px 0; }


       .info-row.date-time {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  font-weight: 700;
  width: 100%;
}
.info-row.date-time span {
  white-space: nowrap;   /* 🔥 prevents wrapping */
}
    .info-label {
      font-weight: 800;
    }

  .items-header, .item-row {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    width: 100%;
  }

  .items-header {
    border-bottom: 1px solid #000;
    font-weight: 800;
    padding-bottom: 3px;
  }

  .item-row {
    border-bottom: 1px dashed #ccc;
    padding: 2px 0;
  }

  .col-no { width: 5mm; }
  .item-name { flex: 1; padding-right: 2mm; }
  .item-qty { width: 6mm; text-align: center; }
  .item-amount { width: 10mm; text-align: right; }

  .summary {
    margin-top: 6px;
    font-size: 11px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin: 2px 0;
  }
 .service-percentage {
  white-space: nowrap;
}
 
.discount-percentage {
white-space: nowrap;
}
  .summary-row.total {
    font-size: 13px;
    font-weight: 900;
    border-top: 1px solid #000;
    border-bottom: 2px solid #000;
    padding: 4px 0;
  }

  .footer {
    text-align: center;
    margin-top: 8px;
    border-top: 1px dashed #000;
    padding-top: 6px;
    font-size: 10px;
  }

  @media print {
      @page {
        size: 58mm auto;
        margin: 0;
      }
    }
</style>
</head>

<body>
  <div class="invoice">

    <div class="header-center">
      <div class="brand" style="font-weight:900;">HELLO GUYS</div>
      <div>Ph: +91 9903106989</div>
  
      <div style="font-size:9px">
        Address:Shakuntala Park, Kolkata 700061
      </div>
     
    </div>

    ${invoice.Customer_Name ? `
      <div class="info-row">
       <span class="info-label">Customer:</span>
        <span>${invoice.Customer_Name}</span>
      </div>` : ``}

    ${invoice.Customer_Phone ? `
      <div class="info-row">
      <span class="info-label">Phone:</span>
        <span>${invoice.Customer_Phone}</span>
      </div>` : ``}

    <div class="line"></div>

    ${orderType == "dine" ? `<div class="header-center">
      <b>TABLE:${tableNames}</b>
    </div>` : `<div class="header-center">
      <b>TAKEAWAY</b>
    </div>`}
     

    <div class="info-row date-time">
      <span>Date: ${getCurrentDate()}</span>
      <span>Time: ${getCurrentTime()}</span>
    </div>

  
    <div class="info-row">
      <span><b>Invoice:</b> ${invoice.Invoice_Id || "-"}</span>
    </div>

    <div class="line-solid"></div>

    <div class="items-header">
      <div class="col-no">No</div>
      <div class="item-name">ITEM</div>
      <div class="item-qty">QTY</div>
      <div class="item-amount">AMT</div>
    </div>

    ${items.map((it, i) => `
      <div class="item-row">
        <div class="col-no">${i + 1}</div>
        <div class="item-name">${it.Item_Name}</div>
        <div class="item-qty">${it.Quantity}</div>
        <div class="item-amount">₹${Number(it.Amount).toFixed(2)}</div>
      </div>
    `).join("")}

    <div class="line-solid"></div>

    <div class="summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₹${Number(order?.Sub_Total).toFixed(2)}</span>
      </div>
${Number(invoice?.Discount || 0) > 0 ? `
<div class="summary-row">
  <span>Discount&nbsp;</span>
  <span class="discount-percentage">
    ${
      invoice?.Discount_Type === "percentage"
        ? `${String(invoice.Discount).padStart(2, " ")}% ₹${invoice?.Discount_Amount?.toFixed(2)}`
        : `₹${invoice?.Discount_Amount?.toFixed(2)}`
    }
  </span>
</div>
` : ``}
      ${Number(invoice?.Service_Charge || 0) > 0 ? `
<div class="summary-row">
  <span>Dine-In Charge&nbsp;</span>
  <span class="service-percentage">
    ${
      invoice?.Service_Charge_Type === "percentage"
        ? `${String(invoice.Service_Charge).padStart(2, " ")}% ₹${invoice?.Service_Charge_Amount?.toFixed(2)}`
        : `₹${invoice?.Service_Charge_Amount?.toFixed(2)}`
    }
  </span>
</div>
` : ``}

      <div class="summary-row total">
        <span>TOTAL</span>
        <span>₹${Number(invoice.Amount).toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <b>THANK YOU!</b><br/>
      Please Visit Again
    </div>

  </div>
</body>
</html>`;

    /* -------- SILENT PRINT -------- */
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => iframe.contentWindow.print();

    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
  const handleInvoiceDelete = async () => {
    try {
      await deleteInvoice({
        Invoice_Id: selectedInvoice.Invoice_Id,
        orderType: selectedInvoice.orderType, // "dine" | "takeaway"
      }).unwrap();

      toast.success("Invoice deleted");
      setShowDeleteConfirmation(false);
      //refetch(); // ✅ FORCE immediate refresh
      // dispatch(orderApi.util.invalidateTags(["Order"]));
    } catch (err) {
      console.error(err);
      toast.error("Invoice deletion failed");
    }
  };
  const handleDeliveryStatus = async (order, Delivery_Status, orderType) => {
    if (!order || !orderType) return;
    console.log("handleDeliveryStatus", order, Delivery_Status, orderType);
    const payload =
    {
      orderType: "takeaway",
      Takeaway_Order_Id: order.Takeaway_Order_Id,
      Delivery_Status,
    };
    console.log(payload);
    try {
      const res = await updateTakeawayAndDineInDeliveryStatus(payload).unwrap();

      toast.success(res.message || "Status updated successfully!");
      console.log("✅ Status updated:", res);

    } catch (error) {
      console.error("❌ Failed to update delivery status", error);
      toast.error("Failed to update delivery status");
    }
  };

  const InvoiceCard = memo(({ data }) => {
    const isTakeawayOrDineInDelivered = data?.order?.Delivery_Status?.toLowerCase() === "delivered";
    const isExpanded = expandedInvoice === data.invoice.Invoice_Id;
    console.log(data)
    return (
      <div
        style={{

          backgroundColor: isTakeawayOrDineInDelivered ? "#e9ffea" : "#ffa600",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "10px",

          // ✅ GREEN BORDER WHEN DELIVERED TAKEAWAY
          border: isTakeawayOrDineInDelivered
            ? "1px solid #22c55e"
            : "1px solid #fff",

          // boxShadow: isTakeawayOrDineInDelivered
          //   ? "0 0 0 2px rgba(34,197,94,0.25)"
          //   : "0 2px 8px rgba(0,0,0,0.1)",

          transition: "all 0.2s ease",
        }}
      >
        {/* INVOICE HEADER */}
        <div
          style={{
            padding: '16px',
            cursor: 'pointer',

            backgroundColor: isTakeawayOrDineInDelivered ? "#e9ffea" : "#fff ",

            transition: 'background-color 0.2s'
          }}
        // onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
        // onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
        >
          {/* <div
  className={`
    grid
    grid-cols-3 grid-rows-2
    sm:grid-rows-1
    ${data?.orderType === "dine"
      ? "sm:grid-cols-6"
      : "sm:grid-cols-5"}
  `}
  style={{ margin: 0, alignItems: "center" }}
> */}
          {/* <div className='flex justify-between mb-3'>
            
<div>
  {data?.originalOrderType === "pre-book" && <h6
    className="text-2xl font-bold uppercase"
    style={{
      color:
        
           "#ebb811"        // 🟣 Pre_Order
          
    }}
  >
 PRE ORDER
  </h6>}
     </div>       {/* <div>
              {data?.orderType === "pre-book" && <h6
                className="text-2xl font-bold uppercase"
                style={{
                  color:
                    data?.orderType === "pre-book"
                      ? "#ebb811"        // 🟣 Pre_Order
                      : "#374151",       // default
                }}
              >
                PRE ORDER
              </h6>}
            </div> 

            <div className="flex gap-2 justify-end items-end">
              {userMe?.user.role === "admin" && (
                <div className='flex gap-2'>
                  <Trash2
                    onClick={() => {
                      //setSelectedItem(foodItem);     // ← STORE PARTY CLICKED
                      //handleSoftDeleteFoodItem(foodItem.Item_Id);
                      // setSelectedInvoice(data.invoice);
                      // setSelectedOrderType(data.orderType);
                      setSelectedInvoice({
                        Invoice_Id: data.invoice.Invoice_Id,
                        orderType: data.invoice.orderType, // "dine" | "takeaway"
                      })
                      setShowDeleteConfirmation(true)
                      // setIsInvoiceDeleted(true)
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      color: "#ff0000"
                    }} />

                </div>
              )}
              {data?.orderType === "takeaway" && (
                <button
                  type="button"
                  disabled={data?.order?.Delivery_Status === "delivered"}
                  style={{
                    backgroundColor:
                      data?.order?.Delivery_Status === "pending"
                        ? "#7e89eeff"
                        : "#4CAF50"
                  }}
                  onClick={() => {
                    const nextStatus =
                      data?.order?.Delivery_Status === "pending"
                        ? "delivered"
                        : "pending";

                    handleDeliveryStatus(
                      {
                        Order_Id: data?.order?.Order_Id,
                        Takeaway_Order_Id: data?.order?.Takeaway_Order_Id,
                      },
                      nextStatus,
                      data?.orderType
                    );
                  }}
                  className="px-2 py-1 text-sm  font-semibold text-white
                cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
                >
                  {data?.order?.Delivery_Status === "pending"
                    ? "Pending"
                    : "Delivered"}
                </button>
              )}


              {(data?.orderType === "takeaway" || data?.orderType === "dine") && <button
                style={{ backgroundColor: "#ffa600", whiteSpace: "nowrap" }}
                type="button"
                onClick={() => printKOTInvoice(data.kitchens, data.orderType, data.tables)}
                //disabled={isTakeawayCancelOrderLoading}
                //onClick={()=>handleCancelTakeawayOrder(order?.Takeaway_Order_Id)}
                className="px-2 py-1 text-sm  font-semibold text-white
                cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
              >
                Print KOT
              </button>}

              {(data?.orderType === "takeaway" || data?.orderType === "dine") && <button
                type="button"
                style={{ backgroundColor: "#ff0000", whiteSpace: "nowrap" }}
                onClick={() => printBillInvoice(data)}
                //disabled={isTakeawayCancelOrderLoading}
                //onClick={()=>handleCancelTakeawayOrder(order?.Takeaway_Order_Id)}
                className="px-2 py-1 text-sm  font-semibold text-white
                cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
              >
                Print Bill
              </button>}
            </div>
          </div> */}

          <div className="flex flex-col 
          sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">

            {/* LEFT: PRE ORDER TITLE */}
            <div className=" flex items-center justify-center sm:items-left">
              {data?.originalOrderType === "pre-book" && (
                <h6
                  className="text-2xl font-bold uppercase"
                  style={{
                    color: "#ebb811", // 🟣 Pre Order
                  }}
                >
                  PRE ORDER
                </h6>
              )}
            </div>

            {/* RIGHT: ACTION BUTTONS */}
            <div className="flex flex-wrap gap-2 justify-end items-end">

              {/* DELETE — ADMIN ONLY */}
              {userMe?.user.role === "admin" && (
                <div className="flex gap-2">
                  <Trash2
                    onClick={() => {
                      setSelectedInvoice({
                        Invoice_Id: data.invoice.Invoice_Id,
                        orderType: data.invoice.orderType, // "dine" | "takeaway"
                      });
                      setShowDeleteConfirmation(true);
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      color: "#ff0000",
                    }}
                  />
                </div>
              )}

              {/* TAKEAWAY DELIVERY STATUS */}
              {data?.orderType === "takeaway" && (
                <button
                  type="button"
                  disabled={data?.order?.Delivery_Status === "delivered"}
                  style={{
                    backgroundColor:
                      data?.order?.Delivery_Status === "pending"
                        ? "#7e89eeff"
                        : "#4CAF50",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    const nextStatus =
                      data?.order?.Delivery_Status === "pending"
                        ? "delivered"
                        : "pending";

                    handleDeliveryStatus(
                      {
                        Order_Id: data?.order?.Order_Id,
                        Takeaway_Order_Id: data?.order?.Takeaway_Order_Id,
                      },
                      nextStatus,
                      data?.orderType
                    );
                  }}
                  className="px-2 py-1 text-sm font-semibold text-white
                   cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
                >
                  {data?.order?.Delivery_Status === "pending"
                    ? "Pending"
                    : "Delivered"}
                </button>
              )}

              {/* PRINT KOT */}
              {/* {(data?.orderType === "takeaway" || data?.orderType === "dine") && (
      <button
        style={{ backgroundColor: "#ffa600", whiteSpace: "nowrap" }}
        type="button"
        onClick={() =>
          printKOTInvoice(data.kitchens, data.orderType, data.tables)
        }
        className="px-2 py-1 text-sm font-semibold text-white
                   cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
      >
        Print KOT
      </button>
    )} */}
              {(data?.originalOrderType !== "pre-book" &&
                (data?.orderType === "takeaway" || data?.orderType === "dine")) && (
                  <button
                    type="button"
                    style={{ backgroundColor: "#ffa600", whiteSpace: "nowrap" }}
                    onClick={() =>
                      printKOTInvoice(data.kitchens, data.orderType, data.tables)
                    }
                    className="px-2 py-1 text-sm font-semibold text-white
               cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
                  >
                    Print KOT
                  </button>
                )}

              {/* PRINT BILL */}
              {(data?.orderType === "takeaway" || data?.orderType === "dine") && (
                <button
                  type="button"
                  style={{ backgroundColor: "#ff0000", whiteSpace: "nowrap" }}
                  onClick={() => printBillInvoice(data)}
                  className="px-2 py-1 text-sm font-semibold text-white
                   cursor-pointer sm:px-3 sm:py-1 sm:text-xs"
                >
                  Print Bill
                </button>
              )}

            </div>
          </div>

          {/* <div
  className="grid grid-rows-2 sm:grid-rows-1"
  style={{
    alignItems: "center",
    gridTemplateColumns: "1.2fr 1fr 1fr 2fr 1fr 1fr",
  }}
> */}

          <div
            className="
    grid
    grid-cols-3
    gap-y-3
    sm:grid-cols-6
    sm:gap-y-0
    items-center
  "
          >




            {/* Invoice ID */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: '#ff0000' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                    {data.invoice.Invoice_Id}
                  </div>
                </div>
              </div>
            </div>

            {/* Date */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: '#666' }} />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatDate(data?.invoice?.Invoice_Date)}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="grid justify-items-end sm:justify-items-start" style={{ marginBottom: '10px' }}>
              <span
                style={{
                  backgroundColor: getStatusColor(data.order.Status),
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  display: 'inline-block'
                }}
              >
                {data?.order?.Status === "completed" ? "Paid" : data?.order?.Status}
              </span>
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: '#666' }} />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <span>{data?.invoice?.Customer_Name}</span>
                  <span> - {data?.invoice?.Customer_Phone}</span>
                </div>
              </div>
            </div>

            {/* Tables */}
            {/* {data?.orderType === 'dine' && <div style={{ marginBottom: '10px' }}>
              {data?.tables && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Table2 size={18} style={{ color: '#666' }} />
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {data?.tables?.map(t => t?.Table_Name).join(', ') || 'N/A'}
                  </div>
                </div>
              )}
            </div>} */}
            {/* Tables (COLUMN ALWAYS EXISTS) */}
            <div
              style={{
                marginBottom: "10px",
                visibility: data?.orderType === "dine" ? "visible" : "hidden",
              }}
            >
              {data?.orderType === "dine" && data?.tables && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Table2 size={18} style={{ color: "#666" }} />
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {data.tables.map(t => t.Table_Name).join(", ")}
                  </div>
                </div>
              )}
            </div>



            {/* Amount */}
            <div className="flex justify-end gap-2" style={{ marginBottom: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff0000' }}>
                  ₹{parseFloat(data?.invoice?.Amount).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {data.items?.length || 0} items
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {isExpanded ? (
                  <ChevronUp onClick={() => toggleExpand(data?.invoice?.Invoice_Id)} />
                ) : (
                  <ChevronDown onClick={() => toggleExpand(data?.invoice?.Invoice_Id)} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* EXPANDED DETAILS */}
        {isExpanded && (
          <div style={{ padding: '16px', backgroundColor: '#fff' }}>

            {/* Items Table */}
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShoppingCart size={18} style={{ color: '#ff0000' }} />
                Order Items
              </h5>

              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                        Item Name
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
                        Quantity
                      </th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
                        Price
                      </th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items?.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>
                          {item?.Item_Name}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {item?.Quantity}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          ₹{parseFloat(item?.Price).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                          ₹{parseFloat(item?.Amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '2px solid #e0e0e0',
              paddingTop: '15px'
            }}>
              <div
                style={{
                  minWidth: '220px',
                  width: '100%',
                  maxWidth: '360px',   // 👈 prevents overflow on small screens
                }}
              >
                {/* <div style={{ minWidth: '300px' }}> */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#666' }}>Subtotal:</span>
                  <span style={{ fontWeight: '500' }}>
                    ₹{parseFloat(data?.invoice?.Sub_Total || data?.order?.Sub_Total).toFixed(2)}
                  </span>
                </div>

                {data?.invoice?.Discount && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    fontSize: '14px'
                  }}>
                    <span style={{ color: '#666' }}>Discount:</span>
                    <span style={{ fontWeight: '500' }}>
                      {`₹${parseFloat(data?.invoice?.Discount_Amount).toFixed(2)}`}
                    </span>
                    {/* <span style={{ fontWeight: '500' }}>
                      {data?.invoice?.Discount_Type === 'percentage' ?
                        `${data?.invoice?.Discount}%` :
                        `₹${parseFloat(data?.invoice?.Discount).toFixed(2)} `}
                    </span> */}
                  </div>
                )}

                {data?.invoice?.Service_Charge && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    fontSize: '14px'
                  }}>
                    <span style={{ color: '#666' }}>Service Charge:</span>
                    <span style={{ fontWeight: '500' }}>
                      ₹{parseFloat(data?.invoice?.
                        Service_Charge_Amount).toFixed(2)}
                      {/* //₹{parseFloat(data?.invoice?.Service_Charge).toFixed(2)} */}
                    </span>
                    {/* <span style={{ fontWeight: '500' }}>
                      ₹{parseFloat(data?.invoice?.Service_Charge).toFixed(2)}
                    </span> */}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderTop: '2px solid #ff0000',
                  marginTop: '8px'
                }}>
                  <span>Total:</span>
                  <span style={{ color: '#ff0000' }}>
                    ₹{parseFloat(data?.invoice?.Amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  })

  return (
    <>
      

      <div className="sb2-2-3">
        <div className="row" style={{ margin: "0px" }}>
          <div className="col-md-12">
            <div style={{ padding: "20px" }} className="box-inn-sp">



              <div className="inn-title w-full">
                <div className="
      flex flex-col
      lg:flex-row 
      lg:items-center 
      lg:justify-between 
      gap-4
    "
                >
                  {/* LEFT + CENTER grouped for desktop */}
                  <div className="
        flex flex-col 
        items-center 
        text-center 
        gap-2 
        flex-1
        sm:ml-56
      "
                  >
                    {/* Title */}
                    <h3 className="text-lg font-semibold">DATE RANGE REPORT  ({fromDate} → {toDate})</h3>

                    {/* Total invoices */}
                    <h4 className="text-uppercase mt-2 text-gray-700">
                     {getFilterLabel()}: {allInvoicesAndOrderInDateRange?.totalCount}
                    </h4>
                  </div>

                  {/* SEARCH (Desktop Right) */}
                  {/* <div className="hidden sm:block w-56">
      <input
        type="text"
        placeholder="Search ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
    </div> */}
                  <div className="w-full lg:w-56">
                    <input
                      type="text"
                      placeholder="Search ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* SEARCH (Mobile full width) */}
                  {/* <div className="block sm:hidden w-full">
      <input
        type="text"
        placeholder="Search ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
    </div> */}
                </div>
              </div>

                    <div className="flex flex-wrap gap-2 mt-4 mb-2 px-1">
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setActiveFilter(f.key)}
                    style={{
                      padding: '6px 18px',
                      borderRadius: '20px',
                      border: activeFilter === f.key ? '2px solid #ff0000' : '1.5px solid #e0e0e0',
                      backgroundColor: activeFilter === f.key ? '#ff0000' : '#fff',
                      color: activeFilter === f.key ? '#fff' : '#333',
                      fontWeight: activeFilter === f.key ? 'bold' : 'normal',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {!isLoadingInvoicesAndOrdersInDateRange ? <div style={{ padding: "20px", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                {/* <div>
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Invoices</h4>
                    </div>
                    <div className='flex justify-center align-center'>
                    <h4 >
                      Total Invoices: {filteredInvoices.length}
                    </h4>
                    </div> */}

                <div className="grid grid-cols-1  gap-6">

                  {/* LEFT COLUMN - DINE IN INVOICES */}

                  {/* <div>
                    <div className="flex justify-center items-center mb-4">
                      <h4 className="text-2xl font-bold uppercase">Dine-In Invoices</h4>
                    </div>
                    {dineInvoices?.length > 0 && (<div>
                      {dineInvoices?.map((data) => (
                        <InvoiceCard key={data.invoice.Invoice_Id} data={data} />
                      ))}

                    </div>
                    )}
                    {dineInvoices?.length === 0 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',

                      }} className='flex justify-center items-center'>
                        <FileText size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                        <p style={{ fontSize: '16px', color: '#999' }}>No table invoices found</p>
                      </div>
                    )}
                  </div> */}
                  {/* LEFT COLUMN - DINE IN INVOICES */}
                  <div>
                    <div className="flex justify-center items-center mb-4">
                      {/* <h4 className="text-2xl font-bold uppercase">
                        Dine-In Invoices
                      </h4> */}
                    </div>

                    {(isLoadingInvoicesAndOrdersInDateRange || isFetchingAllInvoicesAndOrderInDateRange) ? (

                      /* 🔥 LOADING */
                      <div>
                        {[...Array(5)].map((_, i) => (
                          <InvoiceSkeleton key={i} />
                        ))}
                      </div>

                    ) : invoiceData?.length > 0 ? (

                      /* 🔥 DATA EXISTS */
                      <div>
                        {/* {dineInvoices.map((data) => (
                          <InvoiceCard
                            key={data.invoice.Invoice_Id}
                            data={data}
                          />
                        ))} */}
                            <div>
                      {invoiceData.map(data => (
                        <InvoiceCard key={data.invoice.Invoice_Id} data={data} 
                        />
                      ))}
                    </div>
                      </div>

                    ) : (

                      /* 🔥 EMPTY STATE */
                      <div
                        style={{
                          textAlign: "center",
                          padding: "60px 20px",
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                        }}
                        className="flex justify-center items-center"
                      >
                        <FileText
                          size={48}
                          style={{ color: "#ccc", marginBottom: "16px" }}
                        />
                        <p style={{ fontSize: "16px", color: "#999" }}>
                          No table invoices found
                        </p>
                      </div>

                    )}
                  </div>


                  {/* RIGHT COLUMN - TAKEAWAY INVOICES */}
                  {/* RIGHT COLUMN - TAKEAWAY INVOICES */}
              

                  {/* <div>
                    <div className="flex justify-center items-center mb-4">
                      <h4 className="text-2xl font-bold uppercase">Takeaway Invoices</h4>
                    </div>
                    {takeAwayInvoices?.length > 0 && (<div>
                      {takeAwayInvoices?.map((data) => (
                        <InvoiceCard key={data.invoice.Invoice_Id} data={data} />
                      ))}
                    </div>
                    )}
                    {takeAwayInvoices?.length === 0 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',

                      }} className='flex justify-center items-center'>
                        <FileText size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                        <p style={{ fontSize: '16px', color: '#999' }}>No takeaway invoices found</p>
                      </div>
                    )}
                  </div> */}

                </div>
                {/* <div className="flex justify-center align-center space-x-2 p-4">
                  <button type="button"

                    onClick={() => handlePreviousPage()}
                    disabled={page === 1}
                    className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === 1 ? 'opacity-50 ' : ''}
                `}
                  >
                    ← Previous
                  </button>
                  {[...Array(allInvoicesAndOrderInDateRange?.totalPages).keys()].map((index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      // className={
                      //     `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 
                      //         'bg-gray-200 hover:bg-gray-300'
                      //     }`}
                      //style={{ backgroundColor: page === index + 1 ? '#ff0000' : '', color: page === index + 1 ? 'white' : '' }}
                      className={
                        `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#ff0000] text-white' :
                          'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button type="button"
                    onClick={() => handleNextPage()}
                    disabled={page === allInvoicesAndOrderInDateRange?.totalPages || allInvoicesAndOrderInDateRange?.totalPages === 0}
                    className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === allInvoicesAndOrderInDateRange?.totalPages || allInvoicesAndOrderInDateRange?.totalPages === 0 ? 'opacity-50 ' : ''}
                `}
                  >
                    Next →
                  </button>
                </div> */}

                <div className="flex justify-center align-center p-4">
                  <div className="flex items-center space-x-2 flex-wrap justify-center">

                    {/* PREVIOUS */}
                    <button
                      type="button"
                      onClick={() => handlePreviousPage()}
                      disabled={page === 1}
                      className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
        ${page === 1 ? 'opacity-50 ' : ''}
      `}
                    >
                      ← Previous
                    </button>

                    {/* PAGE NUMBERS — HIDDEN ON SMALL SCREENS */}
                    <div style={{ marginRight: "0px" }}
                      className="hidden sm:flex space-x-2">
                      {/* {[...Array(allInvoicesAndOrderInDateRange?.totalPages).keys()].map((index) => (
        <button
          key={index}
          onClick={() => handlePageChange(index + 1)}
          className={
            `px-3 py-1 rounded ${
              page === index + 1
                ? 'bg-[#ff0000] text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`
          }
        >
          {index + 1}
        </button>
      ))} */}
                      {(() => {
                        const totalPages = allInvoicesAndOrderInDateRange?.totalPages || 1;
                        const maxVisible = 5; // how many pages around current
                        const pages = [];

                        let start = Math.max(1, page - 2);
                        let end = Math.min(totalPages, page + 2);

                        // Adjust if near start
                        if (page <= 3) {
                          end = Math.min(totalPages, maxVisible);
                        }

                        // Adjust if near end
                        if (page > totalPages - 3) {
                          start = Math.max(1, totalPages - maxVisible + 1);
                        }

                        // First page + dots
                        if (start > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => handlePageChange(1)}
                              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                              1
                            </button>
                          );

                          if (start > 2) {
                            pages.push(
                              <span key="start-dots" className="px-2">...</span>
                            );
                          }
                        }

                        // Middle pages
                        for (let i = start; i <= end; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`px-3 py-1 rounded ${page === i
                                ? 'bg-[#ff0000] text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Last page + dots
                        if (end < totalPages) {
                          if (end < totalPages - 1) {
                            pages.push(
                              <span key="end-dots" className="px-2">...</span>
                            );
                          }

                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => handlePageChange(totalPages)}
                              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}

                    </div>

                    {/* CURRENT PAGE — ONLY ON SMALL SCREENS */}
                    <div className="sm:hidden px-3 py-1 bg-gray-100 rounded text-sm">
                      Page {page} / {allInvoicesAndOrderInDateRange?.totalPages || 1}
                    </div>

                    {/* NEXT */}
                    <button
                      type="button"
                      onClick={() => handleNextPage()}
                      disabled={
                        page === allInvoicesAndOrderInDateRange?.totalPages ||
                        allInvoicesAndOrderInDateRange?.totalPages === 0
                      }
                      className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
        ${page === allInvoicesAndOrderInDateRange?.totalPages ||
                          allInvoicesAndOrderInDateRange?.totalPages === 0
                          ? 'opacity-50 '
                          : ''
                        }
      `}
                    >
                      Next →
                    </button>

                  </div>
                </div>

              </div> : (

                <div className='flex justify-center align-center'>
                  <h4 >
                    <Spinner />
                  </h4>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      {showDeleteConfirmation && (
        <DeleteFoodItemModal
          title="Are you sure you want to delete Invoice?"
          description={`Invoice #${selectedInvoice.Invoice_Number} will be deleted`}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleInvoiceDelete}
          isLoading={isInvoiceDeleting}
        />
      )}
    </>
  );
}

import  { useState } from 'react';
import {  FileText, Calendar, DollarSign, ShoppingCart, Users, Table2, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useGetAllInvoicesAndOrdersEachDayQuery } from '../../redux/api/Staff/orderApi';

export default function AllOrdersDayWise() {
  const [searchTerm, setSearchTerm] = useState('');
//   const [invoiceData, setInvoiceData] = useState([]);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
const [page, setPage] = useState(1);
  
  const {date}=useParams();
  console.log(date);


  // Format date
 
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
  const{data:allInvoicesAndOrderEachDay}=useGetAllInvoicesAndOrdersEachDayQuery({  page,
        search: searchTerm,date});
        console.log(searchTerm)
  // Filter invoices
   //const invoiceData=allInvoicesAndOrderEachDay?.data??[]
   const invoiceData = allInvoicesAndOrderEachDay?.data ?? [];

const dineInvoices = invoiceData.filter(
  inv => inv.invoice.orderType === "dine"
);

const takeAwayInvoices = invoiceData.filter(
  inv => inv.invoice.orderType === "takeaway"
);

  console.log(invoiceData);

  // const filteredInvoices = invoiceData.filter(data =>
  //   data.invoice.Invoice_Id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   data.invoice.Order_Id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   data.items?.some(item => item.Item_Name?.toLowerCase().includes(searchTerm.toLowerCase()))
  // );

  // const dineInvoices=filteredInvoices.filter(invoice=>invoice.invoice.orderType==="dine")
  // const takeAwayInvoices=filteredInvoices.filter(invoice=>invoice.invoice.orderType==="takeaway")
   console.log(dineInvoices,takeAwayInvoices,"dineInvoices","takeAwayInvoices");

 
  // Toggle expand/collapse
  const toggleExpand = (invoiceId) => {
  setExpandedInvoice(prev => prev === invoiceId ? null : invoiceId);
};
  // const toggleExpand = (invoiceId) => {
  //   console.log(invoiceId);
    
  //   setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  // };
  const isExpanded = expandedInvoice === invoiceData?.invoice?.Invoice_Id
// const isExpanded = expandedInvoice === invoiceData?.invoice?.Invoice_Id;
console.log(isExpanded,"isExpanded");

  // Status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  // console.log(filteredInvoices)
  return (
    <>
      {/* <div className="sb2-2-2">
        <ul>
          <li>
            <a style={{ display: "flex", flexDirection: "row" }} href="/home">
              <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
              Dashboard
            </a>
          </li>
        </ul>
      </div> */}

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
      <h3 className="text-lg font-semibold">DAILY REPORT</h3>

      {/* Total invoices */}
      <h4 className="text-uppercase mt-2 text-gray-700">
        Total Invoices: {invoiceData?.length}
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


              <div style={{ padding: "20px", backgroundColor: "#f1f1f19d" }} className="tab-inn">
                
                {/* INVOICE CARDS */}
                 {dineInvoices?.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <div className=" flex justify-center items-center">
            <h4 className='text-2xl font-bold text-uppercase'>Table Invoices</h4>
         </div>
                  {dineInvoices?.map((data) => {
                     const isExpanded = expandedInvoice === data.invoice.Invoice_Id;
                    return(<div
                      key={data?.invoice?.Invoice_Id}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      {/* INVOICE HEADER */}
                      <div
                        // onClick={() => toggleExpand(data.invoice.Invoice_Id)}
                        style={{
                          padding: '20px',
                          cursor: 'pointer',
                          backgroundColor: '#fafafa',
                          borderBottom: '1px solid #e0e0e0',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                      >
                        <div className="grid grid-cols-3 grid-rows-2 sm:grid-cols-6 sm:grid-rows-1" style={{ margin: 0, alignItems: 'center' }}>
                          
                          {/* Invoice ID & Order ID */}
                          <div className="" style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={20} style={{ color: '#ff0000' }} />
                              <div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                                  {data.invoice.Invoice_Id}
                                </div>
                                {/* <div style={{ fontSize: '12px', color: '#666' }}>
                                  Order: {data.invoice.Order_Id}
                                </div> */}
                              </div>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="" style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar size={18} style={{ color: '#666' }} />
                              <div style={{ fontSize: '13px', color: '#666' }}>
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
                              {data?.order?.Status}
                            </span>
                          </div>

                          {/* Tables */}

                            <div className="" style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <User size={18} style={{ color: '#666' }} />
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                <span>{data?.invoice?.Customer_Name}</span>
                                <span> - {data?.invoice?.Customer_Phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="" style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Table2 size={18} style={{ color: '#666' }} />
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                {data?.tables?.map(t => t?.Table_Name).join(', ') || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="flex justify-end gap-2" style={{ marginBottom: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0000' }}>
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
                          {/* Icon */}
    

                        </div>
                      </div>

                      {/* EXPANDED DETAILS */}
                      {expandedInvoice === data?.invoice?.Invoice_Id && (
                        <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                          
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
                                    <th style={{ padding: '12px', textAlign: 'left', 
                                        borderBottom: '2px solid #ddd' }}>
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
                            <div style={{ minWidth: '300px' }}>
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
                                    ₹{parseFloat(data?.invoice?.Discount).toFixed(2)}
                                  </span>
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
                                    ₹{parseFloat(data?.invoice?.Service_Charge).toFixed(2)}
                                  </span>
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

                          {/* Action Buttons */}
                          <div style={{ 
                            marginTop: '20px',
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'flex-end'
                          }}>
                            {/* <button
                              onClick={() => window.print()}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: '#fff',
                                color: '#ff0000',
                                border: '2px solid #ff0000',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              Print Invoice
                            </button> */}
                            {/* <button
                              onClick={() => window.location.href = `/invoice/${data.invoice.Invoice_Id}`}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: '#ff0000',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              View Details
                            </button> */}
                          </div>
                        </div>
                      )}
                    </div>
                  )})}

                  {/* No Results */}
                  {dineInvoices.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      backgroundColor: '#fff',
                      borderRadius: '8px'
                    }}>
                      <FileText size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                      <p style={{ fontSize: '16px', color: '#999' }}>No invoices found</p>
                    </div>
                  )}
                </div>}
                
               <div className="border-b border-black-300 mt-2 mb-2"></div>
                 {takeAwayInvoices?.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className=" flex justify-center items-center">
            <h4 className="text-2xl font-bold text-uppercase">Takeaway Invoices</h4>
         </div>
                  {takeAwayInvoices?.map((data) => {
                      const isExpanded = expandedInvoice === data.invoice.Invoice_Id;
                    return(
                    <div
                      key={data?.invoice?.Invoice_Id}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      {/* INVOICE HEADER */}
                      <div
                       
                        style={{
                          padding: '20px',
                          cursor: 'pointer',
                          backgroundColor: '#fafafa',
                          borderBottom: '1px solid #e0e0e0',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                      >
                        <div className="grid grid-cols-3 grid-rows-2 sm:grid-cols-6 sm:grid-rows-1" style={{ margin: 0, alignItems: 'center' }}>
                          
                          {/* Invoice ID & Order ID */}
                          <div className="" style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={20} style={{ color: '#ff0000' }} />
                              <div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                                  {data?.invoice?.Invoice_Id}
                                </div>
                                {/* <div style={{ fontSize: '12px', color: '#666' }}>
                                  Order: {data.invoice.Order_Id}
                                </div> */}
                              </div>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="" style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar size={18} style={{ color: '#666' }} />
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                {formatDate(data?.invoice?.Invoice_Date)}
                              </div>
                            </div>
                          </div>

                          {/* Status */}
                           <div className="grid justify-items-end sm:justify-items-start" style={{ marginBottom: '10px' }}>
                            <span
                              style={{
                                backgroundColor: getStatusColor(data?.order?.Status),
                                color: '#fff',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                display: 'inline-block'
                              }}
                            >
                              {data?.order?.Status}
                            </span>
                          </div>

                          {/* Tables */}
                            <div className="" style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <User size={18} style={{ color: '#666' }} />
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                <span>{data?.invoice?.Customer_Name}</span>
                                <span> - {data?.invoice?.Customer_Phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="" style={{ marginBottom: '10px' }}>
                            {/* <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Table2 size={18} style={{ color: '#666' }} />
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                {data.tables?.map(t => t.Table_Name).join(', ') || 'N/A'}
                              </div>
                            </div> */}
                          </div>

                          {/* Amount */}
                          <div className="flex justify-end gap-2"  style={{ marginBottom: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0000' }}>
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

                              {/* <ChevronDown  onClick={() => toggleExpand(data?.invoice?.Invoice_Id)}/> */}
                              {/* <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff0000' }}>
                                ₹{parseFloat(data.invoice.Amount).toFixed(2)}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {data.items?.length || 0} items
                              </div> */}
                              </div>
                            
                          </div>
                           {/* Icon */}
                        
                        </div>
                      </div>

                      {/* EXPANDED DETAILS */}
                      {expandedInvoice === data.invoice.Invoice_Id && (
                        <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                          
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
                                    <th style={{ padding: '12px', textAlign: 'left', 
                                        borderBottom: '2px solid #ddd' }}>
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
                                  {data.items?.map((item, idx) => (
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
                            <div style={{ minWidth: '300px' }}>
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
                                    ₹{parseFloat(data?.invoice?.Discount).toFixed(2)}
                                  </span>
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
                                    ₹{parseFloat(data?.invoice?.Service_Charge).toFixed(2)}
                                  </span>
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
                                  ₹{parseFloat(data.invoice.Amount).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ 
                            marginTop: '20px',
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'flex-end'
                          }}>
                          
                          </div>
                        </div>
                      )}
                    </div>
                  )})}

                  {/* No Results */}
                  {takeAwayInvoices?.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      backgroundColor: '#fff',
                      borderRadius: '8px'
                    }}>
                      <FileText size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                      <p style={{ fontSize: '16px', color: '#999' }}>No invoices found</p>
                    </div>
                  )}
                </div>}
                  <div className="flex justify-center align-center space-x-2 p-4">
                                <button type="button"
                                    onClick={() => handlePreviousPage()}
                                    disabled={page === 1}
                                    className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === 1 ? 'opacity-50 ' : ''}
                `}
                                >
                                    ← Previous
                                </button>
                                {[...Array(allInvoicesAndOrderEachDay?.totalPages).keys()].map((index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(index + 1)}
                                        // className={
                                        //     `px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 
                                        //         'bg-gray-200 hover:bg-gray-300'
                                        //     }`}
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
                                    disabled={page === allInvoicesAndOrderEachDay?.totalPages || allInvoicesAndOrderEachDay?.totalPages === 0}
                                    className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === allInvoicesAndOrderEachDay?.totalPages || allInvoicesAndOrderEachDay?.totalPages === 0 ? 'opacity-50 ' : ''}
                `}
                                >
                                    Next →
                                </button>
                            </div>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
{/* <div className="inn-title w-full px-2 py-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mt-4">
                  
                  
                  <div className="w-full mt-4 flex justify-between sm:w-auto  justify-between">
                    <div>
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Invoices</h4>
                    </div>
                    <div>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      Total Invoices: {filteredInvoices.length}
                    </p>
                    </div>

                
                  <div className="w-full sm:w-auto flex flex-wrap sm:flex-nowrap justify-start sm:justify-end gap-3">
                    <div className="flex items-center w-full sm:w-56">
                      <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56"
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                          </div>
                </div>
              </div> */}
                {/* <div className="inn-title">
                <div className="flex flex-col 
                sm:flex-col lg:flex-row justify-between lg:materials-center">

                  <div className="flex  justify-evenly w-full gap-4 mb-4 sm:mb-4">
                    {/* <div>
                      <h4 className="text-2xl font-bold mb-1">All Materials</h4>
                      <p className="text-gray-500 text-sm sm:text-base">
                        All Materials Details
                      </p>
                    </div> 
                    <div>
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Invoices</h4>
                    </div>
                    <div className='flex justify-center align-center'>
                    <h4 >
                      Total Invoices: {filteredInvoices.length}
                    </h4>
                    </div>



                  </div>


                  <div
                    className="
        flex flex-col gap-2 sm:flex-row sm:flex-wrap gap-0
        sm:space-x-4 space-y-3 sm:space-y-0
        sm:materials-center
         sm:justify-between
      "
                  >






                    <div className="flex materials-center w-full sm:w-56">
                      <input
                      style={{marginBottom:"0px"}}
                        type="text"
                          placeholder="Search ..."
                        value={searchTerm}
                      
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56"
                      />
                    </div>


                   
                  </div>
                </div>
              </div> */}
              {/* <div className="inn-title">
  <div className="grid grid-rows-2 sm:flex flex-col  lg:flex-row justify-between lg:items-center">

    
    <div className=" grid grid-rows-2 mb-2 gap-2 sm:flex justify-between w-full items-center sm:mb-4 ">

      
      <div>
      
      </div>

     
      <div className="flex  flex-col justify-center items-center">
        <h3>DAILY REPORT</h3>
        <h4 className='text-uppercase mt-4'>
          Total Invoices: {filteredInvoices.length}
        </h4>
      </div>

    
      <div className="hidden sm:flex items-center w-56">
        <input
          style={{ marginBottom: "0px" }}
          type="text"
          placeholder="Search ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

    </div>

    
    <div className="flex sm:hidden w-full mb-3">
      <input
        type="text"
        placeholder="Search ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
    </div>

  </div>
</div> */}
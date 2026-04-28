
import {  useNavigate, useParams } from 'react-router-dom';
import { useGetSinglePartyDetailsSalesPurchasesQuery, usePrintSinglePartyDetailsSalesPurchasesReportMutation } from '../../redux/api/partyAPi';

import { Eye } from 'lucide-react';

export default function PartySalesPurchasesDetails() {
     const TAX_TYPES = {
        "None":"GST 0%",
        "GST0": "GST 0%",
        "GST0.25": "GST 0.25%",
        "GST3": "GST 3%",
        GST5: "GST 5%",
        GST12: "GST 12%",
        GST18: "GST 18%",
        GST28: "GST 28%",
        GST40: "GST 40%",
        "IGST0": "IGST 0%",
        "IGST0.25": "IGST 0.25%",
        "IGST3": "IGST 3%",
        IGST5: "IGST 5%",
        IGST12: "IGST 12%",
        IGST18: "IGST 18%",
        IGST28: "IGST 28%",
        IGST40: "IGST 40%"
    }
 const {id:Party_Id} = useParams();
 const navigate = useNavigate();
  const { data: partyDetails } =
        useGetSinglePartyDetailsSalesPurchasesQuery(Party_Id);
console.log(partyDetails, "partyDetails");
const purchases = partyDetails?.purchases ?? [];
    
    const party= partyDetails?.partyDetails ?? {};
    //const[page, setPage] = useState(1);
    const[singlePartyDetailsSalesPurchases,{isLoading:isPrintLoading}]=
    usePrintSinglePartyDetailsSalesPurchasesReportMutation()

    //const[showRangeModal, setShowRangeModal] = useState(false);
    //   const [fromDate, setFromDate] = useState('');
    //     const [toDate, setToDate] = useState('')
//    const handlePageChange = (newPage) => {
//         setPage(newPage);
//     }
//     const handleNextPage = () => {
//         setPage(page + 1);
//     }
//     const handlePreviousPage = () => {
//         setPage(page - 1);
//     }
    const handlePrint = async () => {
  try {
    const payload = {
      party: partyDetails?.partyDetails,
      purchases: partyDetails?.purchases ?? [],
     
      summary: {
        purchaseSummary: partyDetails?.summary?.purchases,
       
      },
    };

    console.log("Print Payload:", payload);

    const pdfBlob = await singlePartyDetailsSalesPurchases(payload).unwrap(); // your RTK mutation

    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");

  } catch (err) {
    console.error("❌ Print Error:", err);
    alert("Could not generate print PDF.");
  }
};





  return (
    <>
     <div className="sb2-2-3 mt-4">
                 <div className="row" style={{margin: "0px"}}>
                     <div className="col-md-12">
                         <div style={{ padding: "20px" }}
                             className="box-inn-sp">
                             
                       <div className="flex items-center justify-between w-full">
  
  {/* LEFT spacer to center title */}
  <div className="flex-1"></div>

  {/* CENTER TITLE */}
  <div
    className="text-center flex-1 whitespace-nowrap  inn-title "
    style={{ marginTop: "0px", borderBottom: "none" }}
  >
    <h4 className="text-2xl font-bold mb-2">
      PARTY NAME : {party?.Party_Name} 
    </h4>

    <div className='flex flex-row gap-4 w-full'>
        <div >
            <span className=" font-bold mb-2">
               Phone Number : {party?.Phone_Number || "N/A"}
            </span>
        </div>
          <div >
            <span className=" font-bold mb-2">
                Email_Id : {party?.Email_Id || "N/A"}
            </span>
        </div>
          <div >
            <span className="font-bold mb-2">
                Shipping Address : {party?.Shipping_Address || "N/A"}
            </span>
        </div>
    </div>
  </div>

  {/* PRINT BUTTON (Right aligned) */}
  <div className="flex-1 flex mt-4 justify-end gap-4">
    
    
<div className="flex flex-col  justify-center items-center">
  <button
        type="button"
        onClick={() => navigate("/party/all-parties")}
        className="text-white font-bold py-2 px-4 rounded"
        style={{ backgroundColor: "black" }}
      >
        Back
      </button>
      </div>
      <div className="flex flex-col  justify-center items-center">
  <button
        type="button"
        onClick={()=>handlePrint()}
        className="text-white font-bold py-2 px-4 rounded"
        style={{ backgroundColor: "#ff0000" }}
      >
       {isPrintLoading?"Printing...":"Print"}
      </button>
      </div>
  </div>

</div>

                             <div className="flex justify-center align-center">
                                 <h3 className="text-2xl  font-bold mb-2"
                                 style={{color:"red"}}>Total Purchases</h3>
                             </div>
                             {partyDetails && purchases?.length>0 ?
                             purchases?.map((purchases,index) => (
                              <div  key={purchases?.Purchase_Id}>
                              <div className="w-8 h-8 rounded-full mt-1
                              bg-red-500 flex justify-center items-center">
                                <span className="text-white ">{index+1}</span>
                              </div>
                                <div style={{padding:"0"}} className="tab-inn"
                               >
                                       <div style={{width:"100%",padding:"0px"}}
                                                            className="flex  justify-end">
                                                                
<Eye
  onClick={() =>
    navigate(`/inventory/view/${purchases?.Purchase_Id}`, {
      state: {
        from: "party-sales-purchases-details",
        partyId: Party_Id
      }
    })
  }
  style={{
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#ff0000"
  }}
/>

                                                                      </div>
                                 <div style={{background: "#f0f0f0"}} className="row">
                                     
                                 
                                     <div className="input-field col s6">
                                         <span className="active">
                                               Bill Number
                                         </span>
                                         <input type="text" value={purchases?.Bill_Number??""}
                                             className="validate" readOnly />
 
 
                                     </div>
                                     <div className="input-field col s6">
                                         <span className="active">
                                            Bill Date
                                         </span>
                                         <input type="text"
                                         
                                             value={new Date(purchases?.Bill_Date).
                                                toLocaleDateString("en-IN",
                                                {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                }
                                                )??""}
                                             className="validate" readOnly />
 
 
                                     </div>
                                 
                                
                                     <div className="input-field col s6">
                                         <span className="active ">
                                             State of Supply
                                         </span>
                                         <input type="text" value={purchases?.State_Of_Supply??""}
                                             className="validate" readOnly />
 
 
                                     </div>
                                     <div className="input-field col s6">
                                         <span className="active">Payment Type</span>
                                         <input type="text" value={purchases?.Payment_Type??""}
                                             className="validate" readOnly />
 
 
                                     </div>
                                
                                 
                                     <div className="input-field col s6">
 
                                         <span className="active">
                                             Reference Number
 
                                         </span>
                                         <input type="text" value={purchases?.Reference_Number ?? "N/A"}
                                             className="validate" readOnly />
                                     </div>
                                 </div>
                                 <div className="table-responsive table-desi mt-4">
                                     <table className="table table-hover">
                                         <thead>
                                             <tr>
 
                                                 <th>Sl.No</th>
                                                 
                                                 <th>Item</th>
                                                 {/* <th>Item_HSN</th> */}
                                                 <th>Qty</th>
                                                 <th>Unit</th>
                                                 {/* <th>Price/Unit</th> */}
                                                  <th>Price</th>
                                                 <th>Discount</th>
                                                 <th>Tax</th>
                                                 <th>Tax Amount</th>
                                                 <th>Amount</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {purchases?.items?.map((item, index) => (
                                                 <tr key={index}>
                                                     <td>{index + 1}</td>
                                                     
                                                     <td>{item?.Material_Name}</td>
                                                     {/* <td>{item?.Item_HSN}</td> */}
                                                     <td>{item?.Quantity}</td>
                                                     <td>{item?.Item_Unit}</td>
                                                     <td>{item?.Purchase_Price}</td>
                                                     <td>{
                                                          item?.Discount_Type_On_Purchase_Price === "Percentage" ? `${item?.Discount_On_Purchase_Price==0.00?0:
                                                            item?.Discount_On_Purchase_Price}%` : `₹${item?.Discount_On_Purchase_Price}`
                                                     }</td>
                                                    
                                                     <td>{Object.keys(TAX_TYPES).includes(item?.Tax_Type) ? TAX_TYPES[item?.Tax_Type] : item?.Tax_Type
                                                     }</td>
                                                     <td>{item?.Tax_Amount}</td>
                                                     <td>{item?.Amount}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                               <div className="w-full"> {/* Container to ensure the totals span full available width */}
     
     {/* This inner div is what holds the totals and is pushed to the right */}
     <div className="grid grid-cols-3 gap-4  sm:w-1/2 md:w-1/3 "
     style={{width:"100%"}}>
         
         {/* Total Amount Field */}
         <div className="flex justify-between items-center">
             <label className="font-medium">Total Amount</label>
             <input
                 style={{ backgroundColor: "transparent" }}
                 type="text"
                 className="input-field border-b border-gray-300   p-1"
                 value={purchases?.Total_Amount ?? 0.00}
                 readOnly
             />
         </div>
         
         {/* Total Received Field */}
         <div className="flex justify-between items-center">
             <label className="font-medium">Total Paid</label>
             <input
                 style={{ backgroundColor: "transparent" }}
                 type="text"
                 className="input-field border-b border-gray-300  p-1"
                 value={purchases?.Total_Paid ?? 0.00}
                 readOnly
             />
         </div>
         
         {/* Balance Due Field (Often styled differently) */}
         <div className="flex justify-between items-center ">
             <label className="font-bold text-lg">Balance Due</label>
             <input
                 style={{ backgroundColor: "transparent" }}
                 type="text"
                 className="input-field   p-1 font-extrabold text-lg"
                 value={purchases?.Balance_Due ?? 0.00}
                 readOnly
             />
         
         
     </div>
 </div>
 
</div>
</div>
  <div className="border-b border-black-300"></div>
</div>
))
:(<p className="text-center">No Purchases</p>)}

{partyDetails && purchases?.length>0 &&
    <div className="grid grid-rows-2 mt-1">
         <div className=" flex justify-center items-center">
            <h4>Purchase Summary</h4>
         </div>
         {/* Total Amount Field */}
         <div className="grid grid-cols-3 gap-4  sm:w-1/2 md:w-1/3 "
         style={{width:"100%",marginBottom:"0px"}}>
         <div className="flex justify-between items-center">
             <label className="font-medium">Total Amount</label>
             <input
                 style={{ backgroundColor: "transparent" }}
                 type="text"
                 className="input-field border-b border-gray-300   p-1"
                 value={partyDetails?.summary?.purchases?.Total_Amount ?? 0.00}
                 readOnly
             />
         </div>
         
         {/* Total Received Field */}
         <div className="flex justify-between items-center">
             <label className="font-medium">Total Paid</label>
             <input
                 style={{ backgroundColor: "transparent" }}
                 type="text"
                 className="input-field border-b border-gray-300  p-1"
                 value={partyDetails?.summary?.purchases?.Total_Paid?? 0.00}
                 readOnly
             />
         </div>
         
         {/* Balance Due Field (Often styled differently) */}
         <div className="flex justify-between items-center ">
             <label className="font-bold text-lg">Balance Due</label>
             <input
                 style={{ backgroundColor: "transparent" }}
                 type="text"
                 className="input-field   p-1 font-extrabold text-lg"
                 value={partyDetails?.summary?.purchases?.Balance_Due ?? 0.00}
                 readOnly
             />
         
         
     </div>
     </div>
 </div> }
                            
                             <div className="border-b border-black-300"></div>
                          

                              
                                  

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
                            {[...Array(partyDetails?.totalPages).keys()].map((index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    // className={`px-3 py-1 rounded ${page === index + 1 ? 'bg-[#7346ff] text-white' : 'bg-gray-200 hover:bg-gray-300'
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
                                disabled={page === partyDetails?.totalPages || partyDetails?.totalPages === 0}
                                className={`px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded
                ${page === partyDetails?.totalPages || partyDetails?.totalPages === 0 ? 'opacity-50 ' : ''}
                `}
                            >
                                Next →
                            </button>
                        </div> */}
                     </div>
                 </div>
             </div>
    </>
  )
}

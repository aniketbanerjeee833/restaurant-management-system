import { useParams } from "react-router-dom";
import { useEachMaterialReportQuery, usePrintEachMaterialDetailsReportMutation } from "../../redux/api/materialApi"




import { Package, ShoppingCart, TrendingDown, Calendar, User,
     FileText, Database, AlertCircle, 
     IndianRupee} from 'lucide-react';

export default function EachMaterialReport() {
//   const [materialData, setMaterialData] = useState(null);
//   const [eachMaterialReportLoading, seteachMaterialReportLoading] = useState(true);
    const {Material_Name}=useParams();
    console.log("Material_Name",Material_Name);
    const{data:eachMaterialReport,iseachMaterialReportLoading:eachMaterialReporteachMaterialReportLoading}= 
    useEachMaterialReportQuery({ Material_Name })
    console.log("eachMaterialReport",eachMaterialReport,"eachMaterialReporteachMaterialReportLoading",eachMaterialReporteachMaterialReportLoading);
  
  // Mock data - replace with your API call

  const[printEachMaterialDetailsReport,{isLoading:isPrintEachMaterialDetailsReportLoading}]= usePrintEachMaterialDetailsReportMutation();
  const materialDetails = eachMaterialReport?.materialDetails??{};
    const purchaseHistory = eachMaterialReport?.purchaseHistory??[];
    const releaseHistory = eachMaterialReport?.releaseHistory??[];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLowStock = () => {
    if (!eachMaterialReport) return false;
    const current = parseFloat(eachMaterialReport?.materialDetails?.Current_Stock ?? 0);
    const reorder = parseFloat(eachMaterialReport?.materialDetails?.Reorder_Level ?? 0);
    return current <= reorder;
  };

  if (eachMaterialReporteachMaterialReportLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

//   if (!materialData) return null;

//   const { materialDetails, purchaseHistory, releaseHistory } = materialData;

const handlePrint = async() => {
    //console.log("Print function called");
    try{

    
        const payload={
        materialDetails,
        purchaseHistory,
        releaseHistory
    };
      console.log(" Sending payload:", payload);

    const pdfBlob = await printEachMaterialDetailsReport(payload).unwrap();

    const url = URL.createObjectURL(pdfBlob);
    const win = window.open(url, "_blank");
    if (win) win.focus();

  } catch (err) {
    console.error("❌ Print Error:", err);
    alert("Could not generate the print document.");
  }
  }
  return (
    // <div className="min-h-screen bg-gray-50 p-4 md:p-6">
    //   <div className=" mx-auto">
          <div className="sb2-2-3">
        <div className="row" style={{ margin: "0px" }}>
          <div className="col-md-12">
            <div style={{ padding: "20px" }} className="box-inn-sp">
        {/* Header */}
        {/* <div className=" flex flex-col justify-center items-center  mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Material Report
          </h1>
          <p className="text-gray-600">
            Detailed inventory and release history
          </p>
        </div> */}
        <div className="flex items-center px-2 bg-white justify-between w-full">
  
  {/* LEFT spacer to center title */}
  <div className="flex-1"></div>

  {/* CENTER TITLE */}
  <div
    className="text-center flex-1  whitespace-nowrap inn-title "
    style={{ marginTop: "0px", borderBottom: "none" }}
  >
    <h4 className="text-2xl text-uppercase font-bold mb-0">
        Material Report
    </h4>
      <p className="text-gray-600">
            Detailed inventory and release history
          </p>
  </div>

  {/* PRINT BUTTON */}
  <div className="flex-1 flex justify-end">
    <button
      type="button"
      disabled={isPrintEachMaterialDetailsReportLoading}
       onClick={handlePrint}
      className="text-white font-bold py-2 px-4 rounded"
      style={{ backgroundColor: "#ff0000" }}
    >
        {isPrintEachMaterialDetailsReportLoading ? "Printing..." : "Print"}
     
    </button>
  </div>

</div>

        {/* Material Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {materialDetails?.Material_Name}
                </h2>
                {/* <p className="text-sm text-gray-500">
                  ID: {materialDetails?.Material_Id}
                </p> */}
              </div>
            </div>
            
            {isLowStock() && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <AlertCircle size={16} />
                Low Stock
              </div>
            )}
          </div>

          {/* Stock Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Database size={16} className="text-green-600" />
                <span className="text-sm text-gray-600">Current Stock</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {parseFloat(materialDetails?.Current_Stock?? "0").toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {materialDetails?.Current_Stock_Unit ?? "N/A"}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={16} className="text-orange-600" />
                <span className="text-sm text-gray-600">Reorder Level</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {parseFloat(materialDetails?.Reorder_Level ?? "0").toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {materialDetails?.Reorder_Level_Unit ?? "N/A"}
              </div>
            </div>

            {/* <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-purple-600" />
                <span className="text-sm text-gray-600">Base Unit</span>
              </div>
              <div className="text-lg font-bold text-purple-700 mt-2">
                {materialDetails.Base_Unit}
              </div>
            </div> */}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-blue-600" />
                <span className="text-sm text-gray-600">Shelf Life</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {materialDetails.Shelf_Life_Days}
              </div>
              <div className="text-xs text-gray-500 mt-1">Days</div>
            </div>

             <div className="bg-red-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee size={16} className="text-red-600" />
                <span className="text-sm text-gray-600">Total Purchase</span>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {eachMaterialReport?.purchaseTotals?.Total_Amount ?? "0"}
                 {/* ₹{purchaseHistory.reduce((sum, p) => sum + parseFloat(p.Amount), 0).toFixed(2)} */}
              </div>
              
            </div>
          

          {/* Timestamps */}
         {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div>
              <span className="font-semibold">Total Purchases:</span>{' '}
              {/* {formatDate(materialDetails.Created_At)} */}
            </div>
            {/* <div>
              <span className="font-semibold">Last Updated:</span>{' '}
              {formatDate(materialDetails.Updated_At)}
            </div> 
          </div>  */}
        </div>

        {/* Two Column Layout for History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Purchase History */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-green-600" size={20} />
                <h3 className="text-lg font-bold text-gray-800">
                  Purchase History
                </h3>
                <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {purchaseHistory?.length} Records
                </span>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {purchaseHistory?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {purchaseHistory?.map((purchase, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {purchase?.Party_Name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Bill {purchase?.Bill_Number}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ₹{parseFloat(purchase?.Amount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Package size={14} />
                          <span>Qty: {purchase?.Quantity} {purchase?.Item_Unit}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <FileText size={14} />
                          <span>₹{parseFloat(purchase?.Purchase_Price).toFixed(2)}/{purchase?.Item_Unit}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 col-span-2">
                          <Calendar size={14} />
                          <span>{formatDate(purchase?.Bill_Date)}</span>
                        </div>
                      </div>
                      
                      {/* <div className="mt-2 text-xs text-gray-400">
                        Purchase ID: {purchase.Purchase_Id}
                      </div> */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No purchase history available</p>
                </div>
              )}
            </div>
          </div>

          {/* Release History */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center gap-2">
                <TrendingDown className="text-red-600" size={20} />
                <h3 className="text-lg font-bold text-gray-800">
                  Release History
                </h3>
                <span className="ml-auto bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {releaseHistory?.length} Records
                </span>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {releaseHistory && releaseHistory?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {releaseHistory?.map((release, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-800">
                            Release {index + 1}
                          </div>
                          {/* <div className="text-xs text-gray-500 mt-1">
                            Material: {release.Material_Id}
                          </div> */}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            -{parseFloat(release?.Released_Quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {release?.Released_Unit}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <User size={14} />
                          <span>Released By: {release?.Released_By_Name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar size={14} />
                          <span>{formatDate(release?.Release_Date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <TrendingDown size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No release history available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        {/* <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Purchases</div>
              <div className="text-2xl font-bold text-green-600">
                {purchaseHistory.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Releases</div>
              <div className="text-2xl font-bold text-red-600">
                {releaseHistory.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Purchase Value</div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{purchaseHistory.reduce((sum, p) => sum + parseFloat(p.Amount), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
     </div>
    </div>
  );
}
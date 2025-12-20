
import { NavLink, useNavigate } from "react-router-dom";
import { partyFormSchema } from "../../schema/partyFormSchema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "react-toastify";
import { partyApi, useAddPartyMutation } from "../../redux/api/partyAPi";
import { LayoutDashboard } from "lucide-react";
import { useDispatch } from "react-redux";

export default function PartyAdd() {
    // const { userId } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("GST & Address");
    const [shippingAdress, setShippingAddress] = useState(false);

    const [addParty, { isLoading: isAddingParty }] = useAddPartyMutation();

    const {
        register,
        handleSubmit,
        
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(partyFormSchema)

    })
    const formValues = watch();
    console.log("Current form values:", formValues);
    console.log("Form errors:", errors);


    const onSubmit = async (data) => {
        console.log("Form Data (from RHF):", data);
        try {
            const res = await addParty({
                body: data,
            }).unwrap();

            console.log(" successfully:", res);
            const resData = res?.data || res;
            dispatch(partyApi.util.invalidateTags(["Party"]));
            if (!resData?.success) {
                toast.error("Failed to add new party");
                return;
            } else {
                toast.success("New Party added successfully!");
                navigate("/party/all-parties");
            }





        } catch (error) {
            const errorMessage =
                error?.data?.message || error?.message || "Failed to add new lead";

            toast.error(errorMessage);
            // toast.error("Failed to add lead");
            console.error("Submission failed", error);
        }

    }
    return (<>

       
        {/* <div className="sb2-2-2">
            <ul >
                <li>
                 
                    <NavLink style={{ display: "flex", flexDirection: "row" }}
                        to="/home"

                    >
                        <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
                       
                        Dashboard
                    </NavLink>
                </li>

            </ul>
        </div> */}
        <div className="sb2-2-3 ">
            <div className="row">
                <div className="col-md-12">
                    <div className="box-inn-sp">
                        <div className="inn-title">
                            <h4 className="text-2xl font-bold mb-2">Add Party</h4>
                            <p className="text-gray-500 mb-6">
                                Add new party details
                            </p>
                        </div>
                        <div className=" tab-inn">


                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-3 gap-6">









                                    {/* Party Name Field */}
                                    <div className="flex flex-col">
                                        <span className="active">
                                            Party Name
                                            <span className="text-red-500 font-bold text-lg">&nbsp;*</span>
                                        </span>
                                        <input
                                            type="text"
                                            id="Party_Name"
                                            {...register("Party_Name")}
                                            placeholder=" Party Name"
                                            className="w-full outline-none border-b-2 text-gray-900"
                                        />
                                        {errors?.Party_Name && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Party_Name?.message}
                                            </p>
                                        )}
                                    </div>

                                    {/*GSTIN */}
                                    <div className="flex flex-col mt-2 ">
                                        <span className="active">
                                            GSTIN

                                        </span>

                                        <input
                                            type="text"
                                            id="Gstin"
                                            maxLength={15}
                                            {...register("GSTIN")}
                                            onChange={(e) => {
                                                // Only allow uppercase letters and digits
                                                const filtered = e.target.value
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9]/g, "");
                                                e.target.value = filtered;
                                            }}
                                            placeholder="GSTIN"
                                            className="w-full outline-none border-b-2 text-gray-900 pl-8"
                                        />


                                        {errors?.GSTIN && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.GSTIN?.message}
                                            </p>
                                        )}
                                    </div>


                                    {/*Phone Number */}
                                    <div className="flex flex-col mt-2">
                                        <span className="active">
                                            Phone Number

                                        </span>

                                        <input
                                            type="text"
                                            id="phone-number"
                                            {...register("Phone_Number")}



                                            onInput={(e) => {
                                                // Only allow digits and max 10 characters
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                                            }}
                                            placeholder="Phone Number"
                                            className="w-full outline-none border-b-2 text-gray-900"
                                        />
                                        {errors?.Phone_Number && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors?.Phone_Number?.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-6">
                                    {/* Horizontal Line with Tabs */}
                                    <div className="border-b border-gray-300 flex space-x-8">
                                        {["GST & Address"].map((tab) => (
                                            <button
                                                type="button"
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                style={{
                                                    cursor: "pointer",
                                                    backgroundColor: "transparent",
                                                    border: "none",
                                                    outline: "none",
                                                    padding: "0.5rem 1rem",
                                                    borderBottom: activeTab === tab ? "1px solid red" : "none",
                                                    color: activeTab === tab ? "red" : "gray",
                                                    fontWeight: activeTab === tab ? "600" : "500",
                                                }}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>


                                    {/* Grey Div Below */}
                                    <div className="bg-gray-100 p-6 mt-4 rounded">
                                        {activeTab === "GST & Address" && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-12">


                                                        <div className="flex flex-col ">
                                                            <span className="active">
                                                                State

                                                            </span>
                                                            <select
                                                                id=" State"
                                                                {...register("State")}
                                                                className="w-full outline-none border-b-2 text-gray-900 bg-white"
                                                            >
                                                                <option value="">Select State</option>
                                                                <option value="West Bengal"> West Bengal </option>

                                                                <option value="Maharashtra"> Maharashtra </option>

                                                            </select>
                                                            {errors?.State && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors?.State?.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col ">
                                                            <span className="active">
                                                                Email_Id

                                                            </span>
                                                            <input
                                                                type="text"
                                                                id="Email_Id"
                                                                {...register("Email_Id")}
                                                                placeholder="example@email.com"
                                                                className="w-full outline-none border-b-2 text-gray-900 bg-white"
                                                            />
                                                            {errors?.Email_Id && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors?.Email_Id?.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        {/* Billing Address */}
                                                        <div className="flex flex-col">
                                                            <span className="active">
                                                                Billing Address
                                                            </span>
                                                            <textarea
                                                                style={{ resize: "none" }}
                                                                id="Billing_Address"
                                                                {...register("Billing_Address")}
                                                                className="w-full outline-none text-gray-900 
      bg-white resize-none border border-gray-300 rounded-md p-2 
      h-40"
                                                                placeholder="Billing Address"
                                                            ></textarea>
                                                            {errors?.Billing_Address && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors?.Billing_Address?.message}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* <p className="text-blue-500 cursor-pointer" onClick={() => setShippingAddress(!shippingAdress)}>Add Shipping Address</p> */}
                                                        <p
                                                            className="text-[#ff0000] cursor-pointer font-medium hover:underline mt-2"
                                                            onClick={() => setShippingAddress(!shippingAdress)}
                                                        >
                                                            {shippingAdress
                                                                ? "Hide Shipping Address"
                                                                : "Add Shipping Address"}
                                                        </p>
                                                        {shippingAdress && <div className="flex flex-col">
                                                            <span className="active">
                                                                Shipping Address
                                                            </span>
                                                            <textarea
                                                                style={{ resize: "none" }}
                                                                id="Shipping_Address"
                                                                {...register("Shipping_Address")}
                                                                className="w-full outline-none text-gray-900 
      bg-white resize-none border border-gray-300 rounded-md p-2 
      h-40"
                                                                placeholder="Shipping Address"
                                                            ></textarea>
                                                            {errors?.Shipping_Address && (
                                                                <p className="text-red-500 text-xs mt-1">
                                                                    {errors?.Shipping_Address?.message}
                                                                </p>
                                                            )}
                                                        </div>}
                                                    </div>




                                                </div>
                                                <div className="flex justify-end">
                                                    <button
                                                        type="submit"
                                                        disabled={formValues.errorCount > 0 || isAddingParty}
                                                        className=" text-white font-bold py-2 px-4 rounded"
                                                        style={{ backgroundColor: "#ff0000" }}
                                                    >
                                                        {isAddingParty ? "Adding..." : "Add Party"}
                                                    </button>
                                                </div>
                                            </>
                                        )

                                        }

                                    </div>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>



    </>
    );
};


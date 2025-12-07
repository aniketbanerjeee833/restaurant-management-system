// Layout.jsx


import { useGetUserQuery } from "../../redux/api/userApi";
import SideMenu from "../SideMenu/SideMenu";


export default function Layout({ children }) {
      const { data: userMe, isLoading, isError } =  useGetUserQuery();
      console.log(userMe);
  return (
    <>
       {/* <Header/> */}
    <div className="container-fluid sb2">
      <div className="row">
        {/* Sidebar (always visible) */}
        <div className="sb2-1">
          <SideMenu/>
        </div>

        {/* Main content */}
        <div className="sb2-2">{children}</div>
      </div>
    </div>
    </>
  );
}

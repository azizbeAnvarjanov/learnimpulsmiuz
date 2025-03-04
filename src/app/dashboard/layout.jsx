import React from "react";
import DashboardNavbar from "./DashboardNavbar";

const layout = ({ children }) => {
  return (
    <div>
      {/* <DashboardNavbar /> */}
      <div>{children}</div>
    </div>
  );
};

export default layout;

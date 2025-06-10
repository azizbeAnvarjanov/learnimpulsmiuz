import React from "react";
import { Button } from "@/components/ui/button";
import SuveyForm from "./SuveyForm";

const Sorovnoma = ({ onClose }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black p-5 fixed top-0 left-0 z-50 bg-opacity-80 backdrop-blur-lg text-white">
      <SuveyForm />
      <Button variant="outline" onClick={onClose} className="mt-5 text-black">
        Close
      </Button>
    </div>
  );
};

export default Sorovnoma;

import React from "react";
import { Button } from "./ui/button";

const Navigation = () => {
  return (
    <div className="flex md:flex-row flex-col justify-between bg-gray-100 md:px-16 px-6">
      <div className="py-5 space-x-5">
      <a href="/" className="font-bold text-blue-800">
        Home
      </a>
      <a href="/search" className="font-bold text-blue-800">
        Search
      </a>
      <a href="/welcome" className="font-bold text-blue-800">
        Topics
      </a>
      </div>
      
      <div className="flex justify-center align-middle items-center">
        <a href="/login" className="font-bold text-blue-800">
          <Button className="font-bold text-xs">Log Out</Button>
        </a>
      </div>
    </div>
  );
};

export default Navigation;

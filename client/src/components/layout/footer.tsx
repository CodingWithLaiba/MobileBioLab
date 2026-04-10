import React from "react";

export const Footer: React.FC = () => (
  <footer className="w-full py-4 px-6 bg-white border-t text-center text-xs text-gray-500">
    &copy; {new Date().getFullYear()} MobileBioLab. All rights reserved.
  </footer>
);

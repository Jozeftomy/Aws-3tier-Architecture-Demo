import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:flex md:justify-between md:items-center">
        <div className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SwiftCart. All rights reserved.
        </div>
        <div className="mt-4 md:mt-0 flex justify-center space-x-6 text-sm text-gray-400 items-center">
          <span className="hover:text-primary-600 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-primary-600 cursor-pointer transition-colors">Terms of Service</span>
          <Link to="/admin/login" className="hover:text-amber-600 font-semibold transition-colors">Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

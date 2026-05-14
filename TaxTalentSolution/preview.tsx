import React from "react";

type CertificateProps = {
  name: string;
  description?: string;
  date?: string;
  signature?: string;
  logoUrl: string;
};

const Certificate: React.FC<CertificateProps> = ({
  name,
  description = "In recognition of outstanding performance and contribution.",
  date = "DD/MM/YYYY",
  signature = "Authorized Signatory",
  logoUrl,
}) => {
  return (
    <div className="w-[1000px] h-[700px] bg-white relative shadow-2xl border border-gray-300 overflow-hidden font-serif">
      
      {/* Top Wave */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 rounded-b-[80px]" />

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 rounded-t-[80px]" />

      {/* Header */}
      <div className="absolute top-10 w-full text-center text-white">
        <h1 className="text-4xl tracking-wide font-semibold">
          CERTIFICATE
        </h1>
        <p className="text-lg tracking-widest">OF EXPERIENCE</p>
      </div>

      {/* Logo Badge */}
      <div className="absolute top-36 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-full shadow-lg border-4 border-blue-700">
        <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
      </div>

      {/* Body Content */}
      <div className="absolute top-64 w-full text-center px-16">
        <p className="text-gray-600 text-lg mb-3">
          This Certificate is Proudly Presented to
        </p>

        <h2 className="text-5xl text-blue-900 font-bold mb-4">
          {name}
        </h2>

        <p className="text-gray-700 text-md leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-24 w-full flex justify-between px-20 text-gray-700">
        <div>
          <p className="border-t border-gray-500 w-40 text-center mt-6">
            Date
          </p>
          <p className="text-sm text-center">{date}</p>
        </div>

        <div>
          <p className="border-t border-gray-500 w-48 text-center mt-6">
            Signature
          </p>
          <p className="text-sm text-center">{signature}</p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
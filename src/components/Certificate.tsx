import { BonafideRequestWithProfile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeComponent } from "./QRCode";

interface CertificateProps {
  request: BonafideRequestWithProfile;
}

export const Certificate = ({ request }: CertificateProps) => {
  const { profile } = useAuth();
  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const certificateUrl = `${window.location.origin}/verify/${request.id}`;

  if (!profile) return null;

  return (
    // Using a common serif font stack. For a more official look, you could import a specific font like 'EB Garamond' or 'Playfair Display' in your project's CSS.
    <div className="bg-white p-8 md:p-12 max-w-4xl mx-auto font-serif relative shadow-2xl" style={{ border: '10px solid #c0a062' }}>
      <div className="relative z-10 border-2 border-gray-400 p-8">
        {/* Watermark */}
        <img 
          src="/logo.png" 
          alt="Watermark" 
          className="absolute inset-0 m-auto h-3/4 w-3/4 object-contain opacity-10 z-0"
        />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="College Logo" className="h-24 w-24 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 tracking-wider">Adhiyamaan College of Engineering</h1>
            <p className="text-md text-gray-600">(Autonomous)</p>
            <p className="text-md text-gray-600">Dr. M.G.R. Nagar, Hosur - 635109</p>
            <h2 className="text-3xl font-semibold mt-10 tracking-widest" style={{ textDecoration: 'underline', textDecorationStyle: 'double' }}>BONAFIDE CERTIFICATE</h2>
          </div>

          <div className="flex justify-between items-start mt-12 text-lg">
            <p className="text-gray-700">Certificate ID: {request.id}</p>
            <p className="text-gray-700">Date: {issueDate}</p>
          </div>

          <div className="mt-8 text-xl leading-loose space-y-6 text-justify">
            <p>
              This is to certify that <span className="font-bold">{profile.first_name} {profile.last_name}</span> 
              (Register No: <span className="font-bold">{profile.register_number || 'N/A'}</span>) 
              is a bonafide student of the <span className="font-bold">{profile.department || 'N/A'}</span> department 
              at this institution.
            </p>
            <p>
              This certificate is issued upon their request for the purpose of: <span className="italic font-semibold">{request.reason}</span>.
            </p>
          </div>

          <div className="mt-20 flex justify-between items-end">
            <div className="text-center">
              <QRCodeComponent value={certificateUrl} size={80} />
              <p className="text-xs text-gray-500 mt-1">Scan to verify</p>
            </div>
            <div className="text-center">
              {/* Digital Signature Placeholder */}
              <div className="w-48 h-16 mx-auto mb-2 flex items-center justify-center border-2 border-dashed border-gray-400">
                <span className="text-gray-500 text-sm italic">Signature Placeholder</span>
              </div>
              <p className="font-bold border-t-2 border-gray-700 pt-2">Principal</p>
              <p>Adhiyamaan College of Engineering</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
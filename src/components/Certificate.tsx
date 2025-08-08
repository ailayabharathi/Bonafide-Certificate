import { BonafideRequestWithProfile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

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

  if (!profile) return null;

  return (
    <div className="bg-white p-8 md:p-16 border-4 border-gray-800 max-w-4xl mx-auto font-serif relative overflow-hidden">
      <img 
        src="/placeholder.svg" 
        alt="Watermark" 
        className="absolute inset-0 m-auto h-3/4 w-3/4 object-contain opacity-10 z-0"
      />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <img src="/placeholder.svg" alt="College Logo" className="h-24 w-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Adhiyamaan College of Engineering</h1>
          <p className="text-sm text-gray-600">(Autonomous)</p>
          <p className="text-sm text-gray-600">Dr. M.G.R. Nagar, Hosur - 635109</p>
          <h2 className="text-2xl font-semibold mt-8 underline">BONAFIDE CERTIFICATE</h2>
        </div>

        <div className="mt-12 text-lg leading-relaxed">
          <p className="mb-6">Date: {issueDate}</p>
          <p>This is to certify that <span className="font-bold">{profile.first_name} {profile.last_name}</span> is a bonafide student of this institution.</p>
          <p className="mt-4">This certificate is issued upon their request for the purpose of: <span className="italic">{request.reason}</span>.</p>
          <p className="mt-8">We wish them all the best.</p>
        </div>

        <div className="mt-24 text-right">
          <p className="font-bold">Principal</p>
          <p>Adhiyamaan College of Engineering</p>
        </div>
      </div>
    </div>
  );
};
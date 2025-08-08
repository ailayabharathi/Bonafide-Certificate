import { Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-4">About ACE</h3>
          <p className="text-gray-400">Adhiyamaan College of Engineering (ACE) is a premier institution dedicated to excellence in engineering education, research, and innovation.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <p className="text-gray-400">Dr. M.G.R. Nagar, Hosur, Krishnagiri District, Tamil Nadu, India.</p>
          <p className="text-gray-400">Email: principal@adhiyamaan.ac.in</p>
          <p className="text-gray-400">Phone: 04344 - 260570</p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white"><Facebook /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Twitter /></a>
            <a href="#" className="text-gray-400 hover:text-white"><Linkedin /></a>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 mt-8 border-t border-gray-700 pt-4">
        <p>&copy; {new Date().getFullYear()} Adhiyamaan College of Engineering. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
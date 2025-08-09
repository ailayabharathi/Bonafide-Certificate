import { Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground p-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-4">About ACE</h3>
          <p className="text-muted-foreground">Adhiyamaan College of Engineering (ACE) is a premier institution dedicated to excellence in engineering education, research, and innovation.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <p className="text-muted-foreground">Dr. M.G.R. Nagar, Hosur, Krishnagiri District, Tamil Nadu, India.</p>
          <p className="text-muted-foreground">Email: principal@adhiyamaan.ac.in</p>
          <p className="text-muted-foreground">Phone: 04344 - 260570</p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-foreground"><Facebook /></a>
            <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter /></a>
            <a href="#" className="text-muted-foreground hover:text-foreground"><Linkedin /></a>
          </div>
        </div>
      </div>
      <div className="text-center text-muted-foreground mt-8 border-t border-border pt-4">
        <p>&copy; {new Date().getFullYear()} Adhiyamaan College of Engineering. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
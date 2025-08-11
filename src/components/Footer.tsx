import { Facebook, Linkedin, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-2">Adhiyamaan College of Engineering</h2>
            <p className="text-muted-foreground">Dr. M.G.R. Nagar, Hosur - 635130, Krishnagiri (Dt), Tamilnadu, India.</p>
            <p className="text-muted-foreground mt-2">Phone: 04344-260570, 261002, 261020, 261034</p>
            <p className="text-muted-foreground">Email: principal@adhiyamaan.ac.in</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Home</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Admissions</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4 items-center">
              <a href="https://www.facebook.com/adhiyamaancollegeofengg/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Facebook /></a>
              <a href="https://in.linkedin.com/company/adhiyamaan-college-of-engineering-ace" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Twitter /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Youtube /></a>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-muted-foreground text-sm">
          <p>&copy; 2024 Adhiyamaan College of Engineering. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background items-center">
      <Header />
      <main className="flex-grow w-full">
        <section className="relative bg-cover bg-center h-[60vh]" style={{ backgroundImage: "url('https://www.adhiyamaan.ac.in/wp-content/uploads/2023/08/DJI_0010-scaled.jpg')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Welcome to Adhiyamaan College of Engineering</h1>
              <p className="text-lg md:text-xl mb-8">A Premier Institution for Technical Education</p>
              <Link to="/login">
                <Button size="lg">Apply for Bonafide Certificate</Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="py-16 px-8">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">About Our Institution</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Adhiyamaan College of Engineering is one of the educational institutions developed by Adhiyamaan Educational & Research Institution Trust. The college is an Autonomous Institution, approved by AICTE, New Delhi, and affiliated to Anna University, Chennai. It is located in a serene and peaceful area of 250 acres of land, providing an ideal environment for learning.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <MadeWithDyad />
    </div>
  );
};

export default Index;
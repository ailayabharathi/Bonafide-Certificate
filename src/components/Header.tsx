import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 px-8 bg-white shadow-md w-full">
      <Link to="/" className="flex items-center space-x-4">
        <img src="/placeholder.svg" alt="College Logo" className="h-12 w-12" />
        <h1 className="text-lg md:text-xl font-bold text-gray-800">Adhiyamaan College of Engineering</h1>
      </Link>
      <nav>
        <Link to="/login">
          <Button>Login / Apply</Button>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
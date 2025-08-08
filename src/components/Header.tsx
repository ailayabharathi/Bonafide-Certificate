import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 px-8 bg-card text-card-foreground shadow-md w-full">
      <Link to="/" className="flex items-center space-x-4">
        <img src="/placeholder.svg" alt="College Logo" className="h-12 w-12" />
        <h1 className="text-lg md:text-xl font-bold">Adhiyamaan College of Engineering</h1>
      </Link>
      <nav className="flex items-center gap-4">
        <ThemeToggle />
        <Link to="/login">
          <Button>Login / Apply</Button>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
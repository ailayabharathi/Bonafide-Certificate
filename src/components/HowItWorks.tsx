import { LogIn, FileText, History, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: <LogIn className="h-8 w-8 text-primary" />,
    title: "1. Login or Sign Up",
    description: "Access the portal using your college credentials. New users can sign up with their college email.",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "2. Submit Your Request",
    description: "Fill out a simple form with the reason for your bonafide certificate request.",
  },
  {
    icon: <History className="h-8 w-8 text-primary" />,
    title: "3. Track Real-Time Status",
    description: "Monitor your application's progress as it moves through tutor, HOD, and office approval stages.",
  },
  {
    icon: <Download className="h-8 w-8 text-primary" />,
    title: "4. Download Your Certificate",
    description: "Once approved, download your digitally signed, QR-verifiable bonafide certificate instantly.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 px-8 bg-secondary">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-foreground">How It Works</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
          Our streamlined digital process makes getting your bonafide certificate simpler than ever.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  {step.icon}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
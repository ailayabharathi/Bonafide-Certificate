import { QrCode, BellRing, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: "Secure & Verifiable",
    description: "Every certificate comes with a unique QR code for instant, tamper-proof verification by any third party.",
  },
  {
    icon: <BellRing className="h-10 w-10 text-primary" />,
    title: "Real-Time Notifications",
    description: "Stay informed with automatic email and in-app notifications at every stage of the approval process.",
  },
  {
    icon: <QrCode className="h-10 w-10 text-primary" />,
    title: "Digital & Eco-Friendly",
    description: "Access your certificate anytime, anywhere. Reduce paper usage and eliminate physical queues.",
  },
];

const KeyFeatures = () => {
  return (
    <section className="py-16 px-8">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-foreground">Key Features</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
          A modern solution for a modern institution.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-left p-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Leaf,
  Sprout,
  Sun,
  Droplets,
  Users,
  Phone,
  ShieldCheck,
  MapPin,
  BarChart4,
} from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Hero Section */}
      <div className="relative h-[90vh]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80"
            alt="Farm field at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-xl">
              Sustainable Farming for a Better Tomorrow
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Leading the way in modern agricultural practices with a focus on
              sustainability, innovation, and community development.
            </p>
            <div className="space-x-4">
              <Button
                size="lg"
                className="bg-green-600 font-bold hover:bg-green-700"
              >
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="font-bold">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="bg-gradient-to-b from-white dark:from-gray-950 to-gray-50 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: BarChart4, label: "Data-Driven Decisions" },
            { icon: ShieldCheck, label: "Trusted by Farmers" },
            { icon: MapPin, label: "Serving Rural India" },
            { icon: Sun, label: "Powered by Clean Energy" },
          ].map((feature, idx) => (
            <div key={idx} className="text-center">
              <div className="mx-auto bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-lg">{feature.label}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Our Agricultural Services
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Leaf,
                title: "Plant Disease Prediction",
                desc: "AI-powered diagnosis of plant diseases using image recognition and ML models.",
              },
              {
                icon: Sprout,
                title: "Animal Disease Prediction",
                desc: "Detect and monitor livestock diseases early through advanced analysis.",
              },
              {
                icon: Sun,
                title: "Weather Dashboard",
                desc: "Real-time weather forecasting tailored for farmers' specific needs.",
              },
              {
                icon: Users,
                title: "Community Support",
                desc: "Connect, share, and grow with a community of like-minded farmers.",
              },
              {
                icon: Phone,
                title: "Selling Products",
                desc: "Sell and buy farming goods through our built-in marketplace.",
              },
              {
                icon: Droplets,
                title: "Fertilizer Recommendation",
                desc: "Get precise fertilizer suggestions based on soil and crop data.",
              },
              {
                icon: BarChart4,
                title: "Crop Recommendation",
                desc: "Find the best-suited crops for your land, soil, and region.",
              },
              {
                icon: ShieldCheck,
                title: "Yield Prediction",
                desc: "Forecast your crop yield with smart analytics and planning tools.",
              },
              {
                icon: MapPin,
                title: "Yield Management",
                desc: "Track, analyze, and optimize your farm's yield over time.",
              },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <Card
                key={idx}
                className="border-none shadow-lg dark:bg-gray-800"
              >
                <CardContent className="pt-6">
                  <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-green-100">
            Contact us today to learn more about our agricultural services and
            how we can help you.
          </p>
          <Button
            size="lg"
            className="bg-white text-green-900 hover:bg-green-50"
          >
            Contact Us
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">About Us</h3>
              <p className="text-sm">
                Leading agricultural solutions provider committed to sustainable
                farming practices and community development.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm">
                <li>Plant Disease Prediction</li>
                <li>Animal Disease Prediction</li>
                <li>Weather Dashboard</li>
                <li>Community Support</li>
                <li>Fertilizer Recommendation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>Email: contact@agritech.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Address: 123 Farm Road</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white">
                  Facebook
                </a>
                <a href="#" className="hover:text-white">
                  Twitter
                </a>
                <a href="#" className="hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            © 2025 AgriTech. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

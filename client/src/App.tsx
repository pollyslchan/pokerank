import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FullRankings from "@/pages/FullRankings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function InitializePokemonData() {
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Pokemon data on app load
    const initData = async () => {
      try {
        const response = await fetch("/api/init");
        const data = await response.json();
        if (data.success) {
          console.log("Pokemon data initialized:", data.message);
        } else {
          toast({
            title: "Error initializing data",
            description: data.message || "Could not initialize Pokemon data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to initialize Pokemon data:", error);
        toast({
          title: "Error initializing data",
          description: "Failed to connect to the server",
          variant: "destructive",
        });
      }
    };

    initData();
  }, [toast]);

  return null;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/rankings" component={FullRankings} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InitializePokemonData />
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

import { MASForm } from "@/components/MASForm";
import { AlertTriangle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import siemensLogo from "@/assets/siemens-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="siemens-gradient text-primary-foreground">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={siemensLogo} alt="Siemens" className="h-12" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">MAS</h1>
                <p className="text-xs text-primary-foreground/80">Minute d'Arrêt Sécurité</p>
              </div>
            </div>
            <Link 
              to="/admin" 
              className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
              title="Administration"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="banner-warning">
        <div className="container flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">NE PAS COMMENCER LE TRAVAIL SI TOUS LES RISQUES NE SONT PAS MAÎTRISÉS</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-6 pb-12">
        <MASForm />
      </main>
    </div>
  );
};

export default Index;
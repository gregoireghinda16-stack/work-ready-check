import { MASForm } from "@/components/MASForm";
import { AlertTriangle, Settings, Shield, Download } from "lucide-react";
import { Link } from "react-router-dom";
import siemensLogo from "@/assets/siemens-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      {/* Header */}
      <header className="bg-primary shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-accent/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="container py-5 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary-foreground/10 rounded-xl backdrop-blur-sm border border-primary-foreground/10">
                <img src={siemensLogo} alt="Siemens" className="h-10 sm:h-12" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">
                  MASE
                </h1>
                <p className="text-xs sm:text-sm text-primary-foreground/70 font-medium">
                  Minute d'Arrêt Sécurité
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link 
                to="/install" 
                className="p-2.5 rounded-xl hover:bg-primary-foreground/10 transition-all border border-primary-foreground/10 text-primary-foreground"
                title="Installer l'application"
              >
                <Download className="w-5 h-5" />
              </Link>
              <Link 
                to="/admin" 
                className="p-2.5 rounded-xl hover:bg-primary-foreground/10 transition-all border border-primary-foreground/10 text-primary-foreground"
                title="Administration"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="bg-gradient-to-r from-warning to-warning/90 shadow-lg">
        <div className="container py-3.5">
          <div className="flex items-center justify-center gap-3">
            <div className="p-1.5 bg-warning-foreground/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-warning-foreground flex-shrink-0" />
            </div>
            <span className="text-sm sm:text-base font-bold text-warning-foreground tracking-wide">
              NE PAS COMMENCER LE TRAVAIL SI TOUS LES RISQUES NE SONT PAS MAÎTRISÉS
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container pt-6 pb-2">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Sécurité avant tout
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Validez votre MASE avant de commencer
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Complétez les 3 étapes de vérification pour garantir votre sécurité sur le chantier.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-6 pb-12">
        <MASForm />
      </main>

      {/* Footer */}
      <footer className="bg-primary/5 border-t border-border py-4">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Siemens - Application MASE</p>
            <p>Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Apple, Monitor, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import siemensLogo from "@/assets/siemens-logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <img src={siemensLogo} alt="Siemens" className="h-8" />
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Installer l'Application
          </h1>
          <p className="text-muted-foreground">
            Installez MASE sur votre téléphone pour un accès rapide
          </p>
        </div>

        {/* Already installed */}
        {isInstalled && (
          <Card className="border-success bg-success/10">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="font-semibold text-success">Application installée</p>
                <p className="text-sm text-muted-foreground">
                  Vous pouvez lancer MASE depuis votre écran d'accueil
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Android install button */}
        {deferredPrompt && !isInstalled && (
          <Card className="border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5 text-primary" />
                Installation rapide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleInstall}
                className="w-full btn-validate gap-2"
                size="lg"
              >
                <Download className="h-5 w-5" />
                Installer maintenant
              </Button>
            </CardContent>
          </Card>
        )}

        {/* iOS Instructions */}
        {isIOS && !isInstalled && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Apple className="h-5 w-5" />
                Instructions pour iPhone/iPad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </span>
                  <p className="text-sm">
                    Appuyez sur le bouton <strong>Partager</strong> (icône carré avec flèche vers le haut) en bas de Safari
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </span>
                  <p className="text-sm">
                    Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </span>
                  <p className="text-sm">
                    Appuyez sur <strong>"Ajouter"</strong> en haut à droite
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions (fallback) */}
        {isAndroid && !deferredPrompt && !isInstalled && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5" />
                Instructions pour Android
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </span>
                  <p className="text-sm">
                    Appuyez sur le menu <strong>⋮</strong> (trois points) en haut à droite de Chrome
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </span>
                  <p className="text-sm">
                    Appuyez sur <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </span>
                  <p className="text-sm">
                    Confirmez en appuyant sur <strong>"Installer"</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Desktop Instructions */}
        {!isIOS && !isAndroid && !isInstalled && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5" />
                Instructions pour ordinateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sur Chrome ou Edge, cliquez sur l'icône d'installation dans la barre d'adresse (à droite de l'URL).
              </p>
              {deferredPrompt && (
                <Button
                  onClick={handleInstall}
                  className="w-full btn-validate gap-2"
                >
                  <Download className="h-5 w-5" />
                  Installer
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avantages de l'installation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Accès rapide depuis l'écran d'accueil
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Fonctionne même hors connexion
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Pas besoin de télécharger depuis un store
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Mises à jour automatiques
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Go to form button */}
        <Link to="/" className="block">
          <Button variant="outline" className="w-full">
            Accéder au formulaire MASE
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Install;

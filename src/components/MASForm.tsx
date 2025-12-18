import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Shield, Brain, Play, User, Mail, MapPin, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepData {
  step1: boolean;
  step2_1: boolean;
  step2_2: boolean;
  step2_3: boolean;
  step3_1: boolean;
  step3_2: boolean;
}

interface Technician {
  name: string;
  email: string;
}

const TECHNICIANS: Technician[] = [
  { name: "SIMON ANCEL", email: "simon.ancel@siemens.com" },
  { name: "Karim Brahami", email: "karim.brahami@siemens.com" },
  { name: "Cyril Coste", email: "cyril.coste@siemens.com" },
  { name: "OLIVIER HOGUET", email: "olivier.hoguet@siemens.com" },
  { name: "Laurent Juillard", email: "laurent.juillard@siemens.com" },
  { name: "CLEMENT LUCAS", email: "clement.lucas@siemens.com" },
  { name: "Regis Lozinguez", email: "regis.lozinguez@siemens.com" },
  { name: "Bertrand Martinet", email: "bertrand.martinet@siemens.com" },
  { name: "Frederic Mira", email: "frederic.mira@siemens.com" },
  { name: "Franck Tirabassi", email: "franck.tirabassi@siemens.com" },
  { name: "CHRISTIAN UTARD", email: "christian.utard@siemens.com" },
  { name: "Alain Diot", email: "alain.diot.ext@siemens.com" },
];

export function MASForm() {
  const { toast } = useToast();
  const [technicianName, setTechnicianName] = useState("");
  const [siemensEmail, setSiemensEmail] = useState("");
  const [worksiteInfo, setWorksiteInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [checks, setChecks] = useState<StepData>({
    step1: false,
    step2_1: false,
    step2_2: false,
    step2_3: false,
    step3_1: false,
    step3_2: false,
  });

  const handleCheck = (key: keyof StepData) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isStep1Complete = checks.step1;
  const isStep2Complete = checks.step2_1 && checks.step2_2 && checks.step2_3;
  const isStep3Complete = checks.step3_1 && checks.step3_2;
  const isFormComplete = isStep1Complete && isStep2Complete && isStep3Complete && technicianName && siemensEmail;

  // Progress calculation
  const completedSteps = [isStep1Complete, isStep2Complete, isStep3Complete].filter(Boolean).length;
  const progressPercent = (completedSteps / 3) * 100;

  const handleSubmit = async () => {
    if (!isFormComplete) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("mas_submissions")
        .insert({
          technician_name: technicianName,
          siemens_email: siemensEmail,
          worksite_info: worksiteInfo || null,
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "✅ MASE Validée",
        description: "Vous pouvez maintenant démarrer l'activité en toute sécurité.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-slide-up max-w-md">
          <div className="relative">
            <div className="w-28 h-28 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-success" />
            </div>
            <div className="absolute inset-0 w-28 h-28 mx-auto rounded-full animate-ping bg-success/20" style={{ animationDuration: '2s' }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">MASE Validée !</h2>
            <p className="text-muted-foreground">
              Toutes les vérifications sont complètes. Vous pouvez démarrer l'activité en toute sécurité.
            </p>
          </div>
          <div className="bg-success/5 border border-success/20 rounded-xl p-4">
            <p className="text-sm text-success font-medium">
              Enregistrement effectué pour {technicianName}
            </p>
          </div>
          <Button 
            onClick={() => {
              setIsSubmitted(false);
              setChecks({
                step1: false,
                step2_1: false,
                step2_2: false,
                step2_3: false,
                step3_1: false,
                step3_2: false,
              });
              setTechnicianName("");
              setSiemensEmail("");
              setWorksiteInfo("");
            }}
            variant="outline"
            size="lg"
            className="mt-2"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Nouvelle MASE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Progression</span>
          <span className="text-sm font-bold text-accent">{completedSteps}/3 étapes</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {[1, 2, 3].map((step) => (
            <div 
              key={step}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                (step === 1 && isStep1Complete) || (step === 2 && isStep2Complete) || (step === 3 && isStep3Complete)
                  ? 'text-success'
                  : 'text-muted-foreground'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                (step === 1 && isStep1Complete) || (step === 2 && isStep2Complete) || (step === 3 && isStep3Complete)
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {(step === 1 && isStep1Complete) || (step === 2 && isStep2Complete) || (step === 3 && isStep3Complete) 
                  ? <CheckCircle2 className="w-3 h-3" />
                  : step
                }
              </div>
              <span className="hidden sm:inline">Étape {step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Identification</h3>
              <p className="text-xs text-muted-foreground">Informations du technicien</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Nom du Technicien
            </Label>
            <Select
              value={technicianName}
              onValueChange={(value) => {
                setTechnicianName(value);
                const tech = TECHNICIANS.find((t) => t.name === value);
                if (tech) {
                  setSiemensEmail(tech.email);
                }
              }}
            >
              <SelectTrigger className="mt-2 h-12">
                <SelectValue placeholder="Sélectionnez un technicien" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {TECHNICIANS.map((tech) => (
                  <SelectItem key={tech.name} value={tech.name}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              Email Siemens
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="prenom.nom@siemens.com"
              value={siemensEmail}
              readOnly
              className="mt-2 h-12 bg-muted/50"
            />
          </div>
          <div>
            <Label htmlFor="worksite" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Chantier / Entreprise <span className="text-muted-foreground font-normal">(optionnel)</span>
            </Label>
            <textarea
              id="worksite"
              placeholder="Ex: Chantier XYZ, Entreprise ABC..."
              value={worksiteInfo}
              onChange={(e) => setWorksiteInfo(e.target.value)}
              className="mt-2 w-full min-h-[80px] px-4 py-3 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>
      </div>

      {/* Step 1 */}
      <div 
        className={`bg-card rounded-2xl border shadow-sm overflow-hidden animate-slide-up transition-all duration-300 ${
          isStep1Complete ? 'border-success/50 shadow-success/10' : 'border-border'
        }`}
        style={{ animationDelay: '0.1s' }}
      >
        <div className={`px-5 py-4 border-b transition-colors ${
          isStep1Complete ? 'bg-success/5 border-success/20' : 'bg-gradient-to-r from-primary/5 to-transparent border-border'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${
              isStep1Complete ? 'bg-success/10' : 'bg-primary'
            }`}>
              <Shield className={`w-5 h-5 ${isStep1Complete ? 'text-success' : 'text-primary-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Étape 1 : Je prends la MASE</h3>
                {isStep1Complete && <CheckCircle2 className="w-4 h-4 text-success" />}
              </div>
              <p className="text-xs text-muted-foreground">Minute d'Arrêt Sécurité</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4 italic border-l-2 border-accent/50 pl-3">
            "Elle est nécessaire pour vérifier que rien ne peut aller de travers."
          </p>
          
          <div 
            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
              checks.step1 ? 'bg-success/5 border border-success/30' : 'bg-muted/50 border border-transparent hover:border-border'
            }`}
            onClick={() => handleCheck("step1")}
          >
            <Checkbox
              id="step1"
              checked={checks.step1}
              onCheckedChange={() => handleCheck("step1")}
              className="checkbox-siemens"
            />
            <Label htmlFor="step1" className="text-sm font-medium cursor-pointer flex-1">
              Je confirme prendre la Minute d'Arrêt Sécurité
            </Label>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div 
        className={`bg-card rounded-2xl border shadow-sm overflow-hidden animate-slide-up transition-all duration-300 ${
          isStep2Complete ? 'border-success/50 shadow-success/10' : 'border-border'
        }`}
        style={{ animationDelay: '0.2s' }}
      >
        <div className={`px-5 py-4 border-b transition-colors ${
          isStep2Complete ? 'bg-success/5 border-success/20' : 'bg-gradient-to-r from-primary/5 to-transparent border-border'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${
              isStep2Complete ? 'bg-success/10' : 'bg-primary'
            }`}>
              <Brain className={`w-5 h-5 ${isStep2Complete ? 'text-success' : 'text-primary-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Étape 2 : Je RÉFLÉCHIS</h3>
                {isStep2Complete && <CheckCircle2 className="w-4 h-4 text-success" />}
              </div>
              <p className="text-xs text-muted-foreground">Analyse préalable</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {[
            { key: 'step2_1' as keyof StepData, text: "Je connais le mode opératoire spécifique et l'analyse des risques." },
            { key: 'step2_2' as keyof StepData, text: "J'ai les EPI's, habilitations/compétences et moyens matériels prévus." },
            { key: 'step2_3' as keyof StepData, text: "J'identifie les nouvelles interférences (énergies, environnement, interface avec d'autres travaux, météo...)." },
          ].map((item) => (
            <div 
              key={item.key}
              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                checks[item.key] ? 'bg-success/5 border border-success/30' : 'bg-muted/50 border border-transparent hover:border-border'
              }`}
              onClick={() => handleCheck(item.key)}
            >
              <Checkbox
                id={item.key}
                checked={checks[item.key]}
                onCheckedChange={() => handleCheck(item.key)}
                className="checkbox-siemens mt-0.5"
              />
              <Label htmlFor={item.key} className="text-sm cursor-pointer leading-relaxed flex-1">
                {item.text}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3 */}
      <div 
        className={`bg-card rounded-2xl border shadow-sm overflow-hidden animate-slide-up transition-all duration-300 ${
          isStep3Complete ? 'border-success/50 shadow-success/10' : 'border-border'
        }`}
        style={{ animationDelay: '0.3s' }}
      >
        <div className={`px-5 py-4 border-b transition-colors ${
          isStep3Complete ? 'bg-success/5 border-success/20' : 'bg-gradient-to-r from-primary/5 to-transparent border-border'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${
              isStep3Complete ? 'bg-success/10' : 'bg-primary'
            }`}>
              <Play className={`w-5 h-5 ${isStep3Complete ? 'text-success' : 'text-primary-foreground'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Étape 3 : Je sécurise AVANT D'AGIR</h3>
                {isStep3Complete && <CheckCircle2 className="w-4 h-4 text-success" />}
              </div>
              <p className="text-xs text-muted-foreground">Actions de sécurisation</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {[
            { key: 'step3_1' as keyof StepData, text: "Je supprime ou atténue les nouveaux risques identifiés." },
            { key: 'step3_2' as keyof StepData, text: "Je respecte les standards et modes opératoires." },
          ].map((item) => (
            <div 
              key={item.key}
              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                checks[item.key] ? 'bg-success/5 border border-success/30' : 'bg-muted/50 border border-transparent hover:border-border'
              }`}
              onClick={() => handleCheck(item.key)}
            >
              <Checkbox
                id={item.key}
                checked={checks[item.key]}
                onCheckedChange={() => handleCheck(item.key)}
                className="checkbox-siemens mt-0.5"
              />
              <Label htmlFor={item.key} className="text-sm cursor-pointer leading-relaxed flex-1">
                {item.text}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Final Condition */}
      <div 
        className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-2xl border border-warning/20 p-5 animate-slide-up"
        style={{ animationDelay: '0.4s' }}
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-warning/10 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          </div>
          <div>
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Si tout est sécurisé, je DÉMARRE.</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Sinon je fais un <strong className="text-destructive">STOP</strong>. Je préviens mon superviseur et Donneur d'Ordres pour avoir de l'aide.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!isFormComplete || isSubmitting}
        className={`w-full h-14 text-base font-bold rounded-2xl transition-all duration-300 animate-slide-up ${
          isFormComplete 
            ? 'bg-gradient-to-r from-success to-accent hover:shadow-lg hover:shadow-success/25 text-success-foreground' 
            : 'bg-muted text-muted-foreground'
        }`}
        style={{ animationDelay: '0.5s' }}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
            Validation en cours...
          </span>
        ) : isFormComplete ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            VALIDER ET DÉMARRER L'ACTIVITÉ
          </span>
        ) : (
          "Complétez toutes les étapes pour valider"
        )}
      </Button>
    </div>
  );
}

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Shield, Brain, Play } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-slide-up">
          <div className="w-24 h-24 mx-auto bg-success/10 rounded-full flex items-center justify-center animate-pulse-success">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">MASE Validée avec succès</h2>
          <p className="text-muted-foreground">
            Vous pouvez maintenant démarrer l'activité en toute sécurité.
          </p>
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
            className="mt-4"
          >
            Nouvelle MASE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="step-card animate-slide-up">
        <h3 className="font-semibold text-foreground mb-4">Identification</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du Technicien</Label>
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
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionnez un technicien" />
              </SelectTrigger>
              <SelectContent>
                {TECHNICIANS.map((tech) => (
                  <SelectItem key={tech.name} value={tech.name}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="email">Email Siemens</Label>
            <Input
              id="email"
              type="email"
              placeholder="prenom.nom@siemens.com"
              value={siemensEmail}
              readOnly
              className="mt-1 bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="worksite">Chantier / Entreprise (optionnel)</Label>
            <textarea
              id="worksite"
              placeholder="Ex: Chantier XYZ, Entreprise ABC..."
              value={worksiteInfo}
              onChange={(e) => setWorksiteInfo(e.target.value)}
              className="mt-1 w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Step 1 */}
      <div 
        className={`step-card animate-slide-up ${isStep1Complete ? 'step-card-completed' : ''}`}
        style={{ animationDelay: '0.1s' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-lg ${isStep1Complete ? 'bg-success/10' : 'siemens-gradient'}`}>
            <Shield className={`w-5 h-5 ${isStep1Complete ? 'text-success' : 'text-primary-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Étape 1 : Je prends la MASE</h3>
            <p className="text-sm text-muted-foreground">Minute d'Arrêt Sécurité</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 italic">
          "Elle est nécessaire pour vérifier que rien ne peut aller de travers."
        </p>
        
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Checkbox
            id="step1"
            checked={checks.step1}
            onCheckedChange={() => handleCheck("step1")}
            className="checkbox-siemens"
          />
          <Label htmlFor="step1" className="text-sm font-medium cursor-pointer">
            Je confirme prendre la Minute d'Arrêt Sécurité
          </Label>
        </div>
      </div>

      {/* Step 2 */}
      <div 
        className={`step-card animate-slide-up ${isStep2Complete ? 'step-card-completed' : ''}`}
        style={{ animationDelay: '0.2s' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-lg ${isStep2Complete ? 'bg-success/10' : 'siemens-gradient'}`}>
            <Brain className={`w-5 h-5 ${isStep2Complete ? 'text-success' : 'text-primary-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Étape 2 : Je RÉFLÉCHIS</h3>
            <p className="text-sm text-muted-foreground">Analyse préalable</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="step2_1"
              checked={checks.step2_1}
              onCheckedChange={() => handleCheck("step2_1")}
              className="checkbox-siemens mt-0.5"
            />
            <Label htmlFor="step2_1" className="text-sm cursor-pointer leading-relaxed">
              Je connais le mode opératoire spécifique et l'analyse des risques.
            </Label>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="step2_2"
              checked={checks.step2_2}
              onCheckedChange={() => handleCheck("step2_2")}
              className="checkbox-siemens mt-0.5"
            />
            <Label htmlFor="step2_2" className="text-sm cursor-pointer leading-relaxed">
              J'ai les EPI's, habilitations/compétences et moyens matériels prévus.
            </Label>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="step2_3"
              checked={checks.step2_3}
              onCheckedChange={() => handleCheck("step2_3")}
              className="checkbox-siemens mt-0.5"
            />
            <Label htmlFor="step2_3" className="text-sm cursor-pointer leading-relaxed">
              J'identifie les nouvelles interférences (énergies, environnement, interface avec d'autres travaux, météo...).
            </Label>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div 
        className={`step-card animate-slide-up ${isStep3Complete ? 'step-card-completed' : ''}`}
        style={{ animationDelay: '0.3s' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-lg ${isStep3Complete ? 'bg-success/10' : 'siemens-gradient'}`}>
            <Play className={`w-5 h-5 ${isStep3Complete ? 'text-success' : 'text-primary-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Étape 3 : Je sécurise AVANT D'AGIR</h3>
            <p className="text-sm text-muted-foreground">Actions de sécurisation</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="step3_1"
              checked={checks.step3_1}
              onCheckedChange={() => handleCheck("step3_1")}
              className="checkbox-siemens mt-0.5"
            />
            <Label htmlFor="step3_1" className="text-sm cursor-pointer leading-relaxed">
              Je supprime ou atténue les nouveaux risques identifiés.
            </Label>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="step3_2"
              checked={checks.step3_2}
              onCheckedChange={() => handleCheck("step3_2")}
              className="checkbox-siemens mt-0.5"
            />
            <Label htmlFor="step3_2" className="text-sm cursor-pointer leading-relaxed">
              Je respecte les standards et modes opératoires.
            </Label>
          </div>
        </div>
      </div>

      {/* Final Condition */}
      <div 
        className="p-4 bg-muted rounded-xl border border-border animate-slide-up"
        style={{ animationDelay: '0.4s' }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Si tout est sécurisé, je DÉMARRE.</strong><br />
            Sinon je fais un <strong className="text-destructive">STOP</strong>. Je préviens mon superviseur et Donneur d'Ordres pour avoir de l'aide.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!isFormComplete || isSubmitting}
        className="btn-validate bg-success hover:bg-success/90 text-success-foreground disabled:bg-muted disabled:text-muted-foreground"
        style={{ animationDelay: '0.5s' }}
      >
        {isSubmitting ? (
          "Validation en cours..."
        ) : isFormComplete ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            VALIDER ET DÉMARRER L'ACTIVITÉ
          </>
        ) : (
          "Complétez toutes les étapes pour valider"
        )}
      </Button>
    </div>
  );
}
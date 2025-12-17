import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, RefreshCw, Search, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import siemensLogo from "@/assets/siemens-logo.png";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  created_at: string;
  technician_name: string;
  siemens_email: string;
  status: string;
}

const ADMIN_PASSWORD = "siemens2024";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Mot de passe incorrect");
    }
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("mas_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setSubmissions(data);
    }
    setIsLoading(false);
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesName = searchName === "" || 
        s.technician_name.toLowerCase().includes(searchName.toLowerCase());
      
      const matchesDate = !filterDate || 
        new Date(s.created_at).toDateString() === filterDate.toDateString();
      
      return matchesName && matchesDate;
    });
  }, [submissions, searchName, filterDate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();

      const channel = supabase
        .channel("mas_submissions_changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "mas_submissions" },
          (payload) => {
            setSubmissions((prev) => [payload.new as Submission, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="step-card">
            <div className="flex items-center gap-3 mb-6">
              <img src={siemensLogo} alt="Siemens" className="h-14" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Administration</h1>
                <p className="text-sm text-muted-foreground">Siemens MAS</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Entrez le mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
              </div>

              <Button type="submit" className="w-full siemens-gradient text-primary-foreground">
                Accéder au tableau de bord
              </Button>
            </form>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au formulaire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="siemens-gradient text-primary-foreground">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={siemensLogo} alt="Siemens" className="h-12" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">Administration</h1>
                <p className="text-xs text-primary-foreground/80">Tableau de bord MAS</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSubmissions}
                disabled={isLoading}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Formulaire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container py-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="step-card">
            <p className="text-sm text-muted-foreground">Total soumissions</p>
            <p className="text-3xl font-bold text-foreground">{submissions.length}</p>
          </div>
          <div className="step-card">
            <p className="text-sm text-muted-foreground">Aujourd'hui</p>
            <p className="text-3xl font-bold text-foreground">
              {submissions.filter((s) => new Date(s.created_at).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
          <div className="step-card">
            <p className="text-sm text-muted-foreground">Statut</p>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <span className="text-xl font-semibold text-success">Toutes validées</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="step-card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="searchName" className="text-sm mb-1 block">Rechercher par nom</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="searchName"
                  placeholder="Nom du technicien..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-64">
              <Label className="text-sm mb-1 block">Filtrer par date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filterDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, "dd MMM yyyy", { locale: fr }) : "Toutes les dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {(searchName || filterDate) && (
              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setSearchName(""); setFilterDate(undefined); }}
                  className="text-muted-foreground"
                >
                  Effacer filtres
                </Button>
              </div>
            )}
          </div>
          {(searchName || filterDate) && (
            <p className="text-sm text-muted-foreground mt-3">
              {filteredSubmissions.length} résultat(s) trouvé(s)
            </p>
          )}
        </div>

        {/* Table */}
        <div className="step-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Date/Heure</TableHead>
                  <TableHead className="font-semibold">Nom du Technicien</TableHead>
                  <TableHead className="font-semibold">Email Siemens</TableHead>
                  <TableHead className="font-semibold text-center">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {submissions.length === 0 ? "Aucune soumission pour le moment" : "Aucun résultat pour ces filtres"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {format(new Date(submission.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>{submission.technician_name}</TableCell>
                      <TableCell className="text-muted-foreground">{submission.siemens_email}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          <CheckCircle2 className="w-3 h-3" />
                          {submission.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
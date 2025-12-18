import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, RefreshCw, Search, Calendar, Users, ClipboardCheck, Shield, Lock, TrendingUp, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { format, subDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import siemensLogo from "@/assets/siemens-logo.png";
import adminBackground from "@/assets/admin-background.png";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

interface Submission {
  id: string;
  created_at: string;
  technician_name: string;
  siemens_email: string;
  status: string;
  worksite_info: string | null;
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

  const todayCount = useMemo(() => {
    return submissions.filter((s) => new Date(s.created_at).toDateString() === new Date().toDateString()).length;
  }, [submissions]);

  // Chart data: submissions per day (last 14 days)
  const dailyChartData = useMemo(() => {
    const days = 14;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const count = submissions.filter(s => 
        startOfDay(new Date(s.created_at)).getTime() === date.getTime()
      ).length;
      
      data.push({
        date: format(date, "dd/MM", { locale: fr }),
        fullDate: format(date, "dd MMM", { locale: fr }),
        count
      });
    }
    
    return data;
  }, [submissions]);

  // Chart data: submissions per technician
  const technicianChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    submissions.forEach(s => {
      const name = s.technician_name.split(' ').slice(0, 2).join(' ');
      counts[name] = (counts[name] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [submissions]);

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
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div className="bg-primary p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-foreground/10 rounded-full mb-4">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <img src={siemensLogo} alt="Siemens" className="h-10" />
              </div>
              <h1 className="text-xl font-bold text-primary-foreground">Administration MASE</h1>
              <p className="text-sm text-primary-foreground/70 mt-1">Accès sécurisé au tableau de bord</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 h-12 text-base"
                  />
                  {error && (
                    <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
                      {error}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground">
                  Accéder au tableau de bord
                </Button>
              </form>

              <Link
                to="/"
                className="flex items-center justify-center gap-2 mt-5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au formulaire
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${adminBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      {/* Header */}
      <header className="bg-primary shadow-lg relative z-10">
        <div className="container py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary-foreground/10 rounded-xl">
                <img src={siemensLogo} alt="Siemens" className="h-8 sm:h-10" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-primary-foreground">Tableau de bord</h1>
                <p className="text-xs text-primary-foreground/70">Administration MASE</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSubmissions}
                disabled={isLoading}
                className="text-primary-foreground hover:bg-primary-foreground/10 border border-primary-foreground/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 border border-primary-foreground/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Formulaire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6 relative z-10">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-card rounded-xl border border-border shadow-sm p-5 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total soumissions</p>
                <p className="text-4xl font-bold text-foreground mt-2">{submissions.length}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <ClipboardCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-5 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aujourd'hui</p>
                <p className="text-4xl font-bold text-accent mt-2">{todayCount}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-xl">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-5 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut système</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                  </span>
                  <span className="text-lg font-semibold text-success">Opérationnel</span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <Shield className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Daily Evolution Chart */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Évolution journalière</h3>
                <p className="text-xs text-muted-foreground">14 derniers jours</p>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(175, 100%, 40%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(175, 100%, 40%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 88%)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: 'hsl(225, 10%, 45%)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(225, 10%, 45%)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 100%)', 
                      border: '1px solid hsl(225, 20%, 88%)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [value, 'Soumissions']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(175, 100%, 40%)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Technician Chart */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Soumissions par technicien</h3>
                <p className="text-xs text-muted-foreground">Top 10</p>
              </div>
            </div>
            <div className="h-[250px]">
              {technicianChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={technicianChartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 88%)" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 11, fill: 'hsl(225, 10%, 45%)' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: 'hsl(225, 10%, 45%)' }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(0, 0%, 100%)', 
                        border: '1px solid hsl(225, 20%, 88%)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [value, 'Soumissions']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {technicianChartData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? 'hsl(175, 100%, 40%)' : 'hsl(225, 60%, 8%)'}
                          fillOpacity={1 - (index * 0.08)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="searchName" className="text-sm font-medium mb-2 block">Rechercher par nom</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="searchName"
                  placeholder="Nom du technicien..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="sm:w-64">
              <Label className="text-sm font-medium mb-2 block">Filtrer par date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !filterDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, "dd MMM yyyy", { locale: fr }) : "Toutes les dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card" align="start">
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
                  variant="outline" 
                  size="sm"
                  onClick={() => { setSearchName(""); setFilterDate(undefined); }}
                  className="h-11 px-4"
                >
                  Effacer filtres
                </Button>
              </div>
            )}
          </div>
          {(searchName || filterDate) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredSubmissions.length}</span> résultat(s) trouvé(s)
              </p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground py-4">Date/Heure</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Technicien</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Chantier</TableHead>
                  <TableHead className="font-semibold text-foreground py-4">Email</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 text-center">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardCheck className="w-10 h-10 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          {submissions.length === 0 ? "Aucune soumission pour le moment" : "Aucun résultat pour ces filtres"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission, index) => (
                    <TableRow 
                      key={submission.id} 
                      className="hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium py-4">
                        <div className="flex flex-col">
                          <span>{format(new Date(submission.created_at), "dd MMM yyyy", { locale: fr })}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(submission.created_at), "HH:mm", { locale: fr })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium">{submission.technician_name}</span>
                      </TableCell>
                      <TableCell className="py-4 max-w-[200px]">
                        <span className="text-muted-foreground truncate block">
                          {submission.worksite_info || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-muted-foreground text-sm">{submission.siemens_email}</span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
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

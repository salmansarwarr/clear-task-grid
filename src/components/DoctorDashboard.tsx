import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Users, 
  Activity, 
  Bell,
  Plus,
  Search,
  FileText,
  Heart,
  Stethoscope,
  LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  medical_condition: string;
  last_visit: string;
}

interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  type: string;
  priority: string;
  status: string;
  patients: { name: string };
}

export const DoctorDashboard = () => {
  const { user, signOut } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingReviews: 0,
    activeCases: 0
  });
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    phone: "",
    medical_condition: ""
  });
  const [newAppointment, setNewAppointment] = useState({
    patient_id: "",
    title: "",
    appointment_date: "",
    type: "consultation",
    priority: "medium"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDoctorData();
    }
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      // Fetch doctor profile
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (doctorData) {
        setDoctor(doctorData);
        
        // Fetch appointments for today
        const today = new Date().toISOString().split('T')[0];
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select(`
            *,
            patients (name)
          `)
          .eq("doctor_id", doctorData.id)
          .gte("appointment_date", today)
          .lt("appointment_date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
          .order("appointment_date");

        setAppointments(appointmentsData || []);

        // Fetch recent patients
        const { data: patientsData } = await supabase
          .from("patients")
          .select("*")
          .eq("doctor_id", doctorData.id)
          .order("last_visit", { ascending: false })
          .limit(5);

        setPatients(patientsData || []);

        // Calculate stats
        const { data: allAppointments } = await supabase
          .from("appointments")
          .select("*")
          .eq("doctor_id", doctorData.id);

        const { data: allPatients } = await supabase
          .from("patients")
          .select("*")
          .eq("doctor_id", doctorData.id);

        setStats({
          todayAppointments: appointmentsData?.length || 0,
          totalPatients: allPatients?.length || 0,
          pendingReviews: allAppointments?.filter(a => a.status === 'scheduled').length || 0,
          activeCases: allPatients?.filter(p => p.medical_condition).length || 0
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async () => {
    if (!doctor || !newPatient.name) return;

    try {
      const { error } = await supabase
        .from("patients")
        .insert({
          doctor_id: doctor.id,
          ...newPatient
        });

      if (error) throw error;

      setNewPatient({ name: "", email: "", phone: "", medical_condition: "" });
      fetchDoctorData();
      toast({
        title: "Success",
        description: "Patient added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive"
      });
    }
  };

  const addAppointment = async () => {
    if (!doctor || !newAppointment.patient_id || !newAppointment.title || !newAppointment.appointment_date) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .insert({
          doctor_id: doctor.id,
          ...newAppointment
        });

      if (error) throw error;

      setNewAppointment({
        patient_id: "",
        title: "",
        appointment_date: "",
        type: "consultation",
        priority: "medium"
      });
      fetchDoctorData();
      toast({
        title: "Success",
        description: "Appointment scheduled successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Stethoscope className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const statsData = [
    { title: "Today's Appointments", value: stats.todayAppointments.toString(), icon: Calendar, trend: "Today" },
    { title: "Total Patients", value: stats.totalPatients.toString(), icon: Users, trend: "All time" },
    { title: "Pending Reviews", value: stats.pendingReviews.toString(), icon: FileText, trend: "Scheduled" },
    { title: "Active Cases", value: stats.activeCases.toString(), icon: Activity, trend: "With conditions" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <Stethoscope className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{doctor?.name || "Doctor"}</h1>
              <p className="text-muted-foreground">{doctor?.specialty}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarFallback>
                {doctor?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's Appointments</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule New Appointment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="patient">Patient</Label>
                        <Select value={newAppointment.patient_id} onValueChange={(value) => setNewAppointment({...newAppointment, patient_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newAppointment.title}
                          onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                          placeholder="Appointment title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="datetime">Date & Time</Label>
                        <Input
                          id="datetime"
                          type="datetime-local"
                          value={newAppointment.appointment_date}
                          onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={newAppointment.type} onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                            <SelectItem value="check-up">Check-up</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newAppointment.priority} onValueChange={(value) => setNewAppointment({...newAppointment, priority: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addAppointment} className="w-full">
                        Schedule Appointment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No appointments scheduled for today</p>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium">{appointment.patients?.name}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(appointment.priority)}>
                          {appointment.priority}
                        </Badge>
                        <span className="text-sm font-medium">
                          {new Date(appointment.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-20 flex-col space-y-2">
                      <Plus className="h-6 w-6" />
                      <span>Add Patient</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Patient</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newPatient.name}
                          onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                          placeholder="Patient name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newPatient.email}
                          onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                          placeholder="patient@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newPatient.phone}
                          onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition">Medical Condition</Label>
                        <Input
                          id="condition"
                          value={newPatient.medical_condition}
                          onChange={(e) => setNewPatient({...newPatient, medical_condition: e.target.value})}
                          placeholder="Primary condition"
                        />
                      </div>
                      <Button onClick={addPatient} className="w-full">
                        Add Patient
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Calendar className="h-6 w-6" />
                  <span>Schedule</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Search className="h-6 w-6" />
                  <span>Search</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>Reports</span>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Patients */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Latest patient visits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No patients found</p>
                ) : (
                  patients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.medical_condition || 'No condition listed'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'No visits'}
                        </p>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
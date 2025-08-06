import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Users, 
  Clock, 
  Activity, 
  Stethoscope, 
  UserPlus, 
  CalendarPlus,
  FileText,
  Heart,
  TrendingUp,
  Bell
} from "lucide-react";

export function DoctorDashboard() {
  const upcomingAppointments = [
    { id: 1, patient: "Sarah Johnson", time: "09:00 AM", type: "Checkup", priority: "normal" },
    { id: 2, patient: "Michael Chen", time: "10:30 AM", type: "Follow-up", priority: "high" },
    { id: 3, patient: "Emily Davis", time: "02:00 PM", type: "Consultation", priority: "normal" },
    { id: 4, patient: "Robert Wilson", time: "03:30 PM", type: "Emergency", priority: "urgent" },
  ];

  const recentPatients = [
    { id: 1, name: "Anna Martinez", lastVisit: "2 days ago", condition: "Hypertension" },
    { id: 2, name: "James Thompson", lastVisit: "1 week ago", condition: "Diabetes" },
    { id: 3, name: "Lisa Brown", lastVisit: "3 days ago", condition: "Asthma" },
  ];

  const stats = [
    { label: "Today's Patients", value: "12", icon: Users, change: "+2" },
    { label: "Pending Reports", value: "8", icon: FileText, change: "-1" },
    { label: "Avg Wait Time", value: "15m", icon: Clock, change: "-5m" },
    { label: "Satisfaction", value: "4.8", icon: Heart, change: "+0.2" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Dr. Sarah Mitchell
                </h1>
                <p className="text-sm text-muted-foreground">Internal Medicine</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-xs text-success">{stat.change}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Today's Appointments
                  </CardTitle>
                  <CardDescription>
                    {upcomingAppointments.length} appointments scheduled
                  </CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  New Appointment
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <Clock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-sm font-medium">{appointment.time}</p>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(appointment.priority)}>
                        {appointment.priority}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Patients */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <UserPlus className="h-4 w-4" />
                  Add New Patient
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <CalendarPlus className="h-4 w-4" />
                  Schedule Appointment
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <FileText className="h-4 w-4" />
                  Create Prescription
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Activity className="h-4 w-4" />
                  View Lab Results
                </Button>
              </CardContent>
            </Card>

            {/* Recent Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recent Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.condition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{patient.lastVisit}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
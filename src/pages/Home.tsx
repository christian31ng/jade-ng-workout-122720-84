import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckSquare, Clock, Smartphone, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notificationService";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize notification service and restore scheduled notifications
    notificationService.restoreScheduledNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary pb-safe-area-inset-bottom">
      <div className="mobile-container min-h-screen flex flex-col pb-24">{/* Added mobile bottom padding for watermark */}
        {/* Header */}
        <div className="text-center py-6 px-4">
          <div className="flex justify-center mb-6">
            <div className="bg-primary p-4 rounded-2xl shadow-soft">
              <Calendar className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4 pb-2 leading-tight">
            Enji's Sched
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Developed by Christian Anthony Pua Ng
          </p>
        </div>

        {/* Main Card */}
        <div className="flex-1 flex flex-col justify-center">
          <Card className="mobile-card shadow-soft border-0 bg-card/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-foreground leading-relaxed mb-6 text-sm">
                Plan your daily tasks with a beautiful calendar interface. Track your progress and stay organized with this mobile-first scheduling app.
              </p>
              
              <Button 
                onClick={() => navigate('/calendar')}
                className="mobile-button w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300"
              >
                Start Scheduling
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Features</h2>
        </div>
        
        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          <div className="text-center">
            <div className="bg-primary/20 p-3 rounded-xl w-fit mx-auto mb-2">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Calendar View</p>
          </div>
          <div className="text-center">
            <div className="bg-accent/20 p-3 rounded-xl w-fit mx-auto mb-2">
              <CheckSquare className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">Task Tracking</p>
          </div>
          <div className="text-center">
            <div className="bg-secondary/20 p-3 rounded-xl w-fit mx-auto mb-2">
              <Smartphone className="w-5 h-5 text-secondary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Mobile First</p>
          </div>
          <div className="text-center">
            <div className="bg-muted/20 p-3 rounded-xl w-fit mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Progress View</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
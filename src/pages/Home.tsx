import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Users, Clock, Smartphone, TrendingUp } from "lucide-react";
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
            <div className="gradient-primary p-4 rounded-2xl shadow-glow">
              <Dumbbell className="w-12 h-12 text-background" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-fitness-primary to-fitness-secondary bg-clip-text text-transparent mb-4 pb-2 leading-tight">
            JadeNg Training App
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Developed by Jade Estocapio & Christian Ng
          </p>
        </div>

        {/* Main Card */}
        <div className="flex-1 flex flex-col justify-center">
          <Card className="mobile-card shadow-soft border-0 bg-card/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-foreground leading-relaxed mb-6 text-sm">
                Schedule workout programs and exercises with set timers, music, and progress tracking to help you achieve your fitness goals.
              </p>
              
              <Button 
                onClick={() => navigate('/scheduler')}
                className="mobile-button w-full gradient-primary text-background font-semibold hover:opacity-90 transition-all duration-300 shadow-glow"
              >
                Set Your Exercise
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
            <div className="bg-fitness-primary/20 p-3 rounded-xl w-fit mx-auto mb-2">
              <Users className="w-5 h-5 text-fitness-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Weekly Planning</p>
          </div>
          <div className="text-center">
            <div className="bg-fitness-secondary/20 p-3 rounded-xl w-fit mx-auto mb-2">
              <Dumbbell className="w-5 h-5 text-fitness-secondary" />
            </div>
            <p className="text-xs text-muted-foreground">Custom Exercises</p>
          </div>
          <div className="text-center">
            <div className="bg-fitness-accent/20 p-3 rounded-xl w-fit mx-auto mb-2">
              <Clock className="w-5 h-5 text-fitness-accent" />
            </div>
            <p className="text-xs text-muted-foreground">Timer & Music</p>
          </div>
          <div className="text-center">
            <div className="bg-fitness-success/20 p-3 rounded-xl w-fit mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-fitness-success" />
            </div>
            <p className="text-xs text-muted-foreground">Progress Tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
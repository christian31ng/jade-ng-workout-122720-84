import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Upload, Music, Play, Trash2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import WorkoutTimer from "@/components/WorkoutTimer";

interface WorkoutData {
  muscles: string[];
  exercises: Record<string, string[]>;
  duration: number;
}

const Summary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workoutData, setWorkoutData] = useState<Record<string, WorkoutData>>({});
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicName, setMusicName] = useState<string | null>(null);
  const [showMusicUpload, setShowMusicUpload] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<{ day: string; data: WorkoutData } | null>(null);
  const [showTimer, setShowTimer] = useState(false);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const saved = localStorage.getItem('workoutSchedule');
    if (saved) {
      setWorkoutData(JSON.parse(saved));
    }

    const savedMusic = localStorage.getItem('workoutMusic');
    if (savedMusic) {
      const musicData = JSON.parse(savedMusic);
      
      // If we have base64 data, recreate the blob URL
      if (musicData.data) {
        // Convert base64 back to blob
        fetch(musicData.data)
          .then(res => res.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            setMusicUrl(url);
          });
        setMusicName(musicData.name);
      } else if (musicData.url) {
        // Fallback for old format (will be invalid after restart)
        setMusicUrl(musicData.url);
        setMusicName(musicData.name);
      }
    } else {
      setShowMusicUpload(true);
    }
  }, []);

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'audio/mpeg' || file.type === 'audio/mp3' || file.type === 'audio/wav') {
        setMusicFile(file);
        const url = URL.createObjectURL(file);
        setMusicUrl(url);
        setMusicName(file.name);
        
        // Convert file to base64 and save to localStorage for persistence
        const reader = new FileReader();
        reader.onload = () => {
          const musicData = {
            name: file.name,
            data: reader.result as string, // base64 data
            type: file.type
          };
          localStorage.setItem('workoutMusic', JSON.stringify(musicData));
        };
        reader.readAsDataURL(file);
        
        setShowMusicUpload(false);
        
        toast({
          title: "Music Uploaded",
          description: `${file.name} has been uploaded successfully!`
        });
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload an MP3 or WAV file only",
          variant: "destructive"
        });
      }
    }
  };

  const handleStartWorkout = (day: string, data: WorkoutData) => {
    if (!musicUrl) {
      toast({
        title: "No Music",
        description: "Please upload music before starting the workout",
        variant: "destructive"
      });
      return;
    }

    setCurrentWorkout({ day, data });
    setShowTimer(true);
  };

  const handleDeleteMusic = () => {
    // Clear localStorage
    localStorage.removeItem('workoutMusic');
    
    // Reset state
    setMusicFile(null);
    setMusicUrl(null);
    setMusicName(null);
    setShowMusicUpload(true);
    
    toast({
      title: "Music Deleted",
      description: "Workout music has been removed from storage"
    });
  };

  const hasWorkouts = Object.keys(workoutData).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-x-hidden pb-safe-area-inset-bottom">
      <div className="mobile-container max-w-4xl mx-auto relative z-10 pb-24">{/* Added mobile bottom padding for watermark */}
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/scheduler')}
            className="mobile-button text-foreground hover:bg-muted/50 shadow-3d hover:shadow-3d-hover"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="text-center">
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-fitness-primary to-fitness-secondary bg-clip-text text-transparent px-4">
              Weekly Summary
            </h1>
            <Button
              onClick={() => navigate('/progress')}
              variant="outline"
              className="mt-2 mobile-button border-fitness-primary/30 text-fitness-primary hover:bg-fitness-primary/10 hover:border-fitness-primary/50"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Progress Tracking
            </Button>
          </div>
          <div className="w-16 sm:w-20"></div>
        </div>

        {/* Music Upload Section */}
        <Card className="mobile-card mb-6 border border-fitness-secondary/30 bg-gradient-to-r from-fitness-secondary/10 to-fitness-secondary/5 glass-card backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-fitness-secondary text-lg font-semibold">
              <div className="p-2 rounded-xl bg-fitness-secondary/20 shadow-3d">
                <Music className="w-5 h-5" />
              </div>
              Workout Music
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!musicUrl || showMusicUpload ? (
              <div>
                <Label htmlFor="music-upload" className="text-sm font-medium text-foreground mb-2 block">
                  Upload MP3/WAV File for Timer
                </Label>
                <div className="relative">
                  <Input
                    id="music-upload"
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/mp4,audio/wav"
                    onChange={handleMusicUpload}
                    className="mobile-input w-full h-16 bg-background/50 border-fitness-secondary/30 text-foreground file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-fitness-secondary file:text-background hover:file:bg-fitness-secondary/90 file:shadow-3d file:transition-all file:duration-200"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-fitness-success/10 border border-fitness-success/30 rounded-xl shadow-3d">
                  <div className="p-2 rounded-xl bg-fitness-success/20">
                    <Music className="w-4 h-4 text-fitness-success" />
                  </div>
                  <span className="text-sm font-medium flex-1 truncate text-foreground">{musicName}</span>
                  <div className="w-3 h-3 bg-fitness-success rounded-full flex-shrink-0 shadow-glow"></div>
                </div>
                <Button
                  onClick={handleDeleteMusic}
                  variant="outline"
                  className="w-full mobile-button border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Music
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workout Schedule */}
        {hasWorkouts ? (
          <div className="mobile-grid">
            {days.map((day) => {
              const workout = workoutData[day];
              if (!workout) return null;

              return (
                <Card key={day} className="mobile-card border border-fitness-primary/30 bg-gradient-to-br from-fitness-primary/10 to-fitness-primary/5 glass-card backdrop-blur-sm relative overflow-hidden">
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-fitness-primary/5 to-transparent pointer-events-none" />
                  
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg sm:text-xl font-bold text-fitness-primary flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-fitness-primary shadow-glow" />
                        {day}
                      </CardTitle>
                      <Button
                        onClick={() => handleStartWorkout(day, workout)}
                        size="sm"
                        className="mobile-button bg-gradient-to-r from-fitness-primary to-fitness-primary-glow hover:from-fitness-primary/90 hover:to-fitness-primary-glow/90 text-background font-semibold shadow-3d hover:shadow-3d-hover"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm relative z-10">
                    {workout.muscles.map((muscle) => (
                      <div key={muscle} className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-3d">
                        <h4 className="font-bold text-fitness-primary mb-3 text-base flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-fitness-secondary" />
                          {muscle}
                        </h4>
                        <ul className="text-sm text-foreground space-y-2">
                          {workout.exercises[muscle]
                            ?.filter(exercise => exercise.trim())
                            .slice(0, workout.exercises[muscle].filter(exercise => exercise.trim()).length <= 5 ? undefined : 3) // Show all if 5 or less, otherwise show first 3
                            .map((exercise, index) => (
                            <li key={index} className="flex items-start gap-3 p-2 rounded-lg bg-background/30">
                              <span className="text-fitness-secondary font-bold text-xs mt-0.5">•</span>
                              <span className="text-foreground font-medium">{exercise}</span>
                            </li>
                          ))}
                          {workout.exercises[muscle]?.filter(exercise => exercise.trim()).length > 5 && (
                            <li className="text-fitness-accent text-sm italic p-2 rounded-lg bg-fitness-accent/10 border border-fitness-accent/20">
                              +{workout.exercises[muscle].filter(exercise => exercise.trim()).length - 3} more exercises
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-fitness-primary/20 bg-background/30 rounded-xl p-4 shadow-inset">
                      <div className="text-center">
                        <span className="text-sm font-bold text-fitness-secondary">
                          Duration: {workout.duration} {workout.duration === 1 ? 'minute' : 'minutes'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mobile-card text-center py-12 border border-muted/30 bg-gradient-to-br from-muted/10 to-transparent glass-card">
            <CardContent>
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-fitness-primary/20 flex items-center justify-center shadow-3d">
                  <ArrowLeft className="w-8 h-8 text-fitness-primary" />
                </div>
                <p className="text-foreground mb-6 text-base font-medium">
                  No workouts scheduled yet. Go back to create your workout plan.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/scheduler')} 
                className="mobile-button bg-gradient-to-r from-fitness-primary to-fitness-secondary hover:from-fitness-primary/90 hover:to-fitness-secondary/90 text-background font-semibold shadow-3d hover:shadow-3d-hover"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Create Workout Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Timer Modal */}
        {showTimer && currentWorkout && (
          <WorkoutTimer
            day={currentWorkout.day}
            workout={currentWorkout.data}
            musicUrl={musicUrl}
            onClose={() => {
              setShowTimer(false);
              setCurrentWorkout(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Summary;
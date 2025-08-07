import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkoutData {
  muscles: string[];
  exercises: Record<string, string[]>;
  duration: number;
}

interface WorkoutTimerProps {
  day: string;
  workout: WorkoutData;
  musicUrl: string | null;
  onClose: () => void;
}

const WorkoutTimer = ({ day, workout, musicUrl, onClose }: WorkoutTimerProps) => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(workout.duration * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = workout.duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (musicUrl && audioRef.current) {
      audioRef.current.src = musicUrl;
      audioRef.current.loop = true;
    }
  }, [musicUrl]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            if (audioRef.current) {
              audioRef.current.pause();
            }
            // Trigger notification/alarm
            handleWorkoutComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleWorkoutComplete = () => {
    toast({
      title: "Workout Complete! 🎉",
      description: `Great job completing your ${day} workout!`,
      duration: 5000,
    });
    
    // Try to trigger browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Workout Complete!", {
        body: `Great job completing your ${day} workout!`,
        icon: "/favicon.ico"
      });
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      requestNotificationPermission();
      if (audioRef.current && musicUrl) {
        audioRef.current.play().catch(console.error);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(workout.duration * 60);
    setIsCompleted(false);
    setCompletedExercises({});
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleExerciseComplete = (exerciseKey: string, checked: boolean) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseKey]: checked
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsRunning(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2">
      <Card className="w-full max-w-md bg-card border-2 border-fitness-primary/20 max-h-[95vh] flex flex-col">
        <CardHeader className="text-center border-b border-border pb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-fitness-primary">{day} Workout</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-fitness-secondary">
            {formatTime(timeLeft)}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 space-y-3 flex-1 overflow-hidden flex flex-col">
          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress 
              value={progress} 
              className="h-2 bg-muted"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(totalSeconds - timeLeft)} elapsed</span>
              <span>{workout.duration} min total</span>
            </div>
          </div>

          {/* Today's Focus Header - Sticky */}
          <div className="bg-muted/50 rounded-lg p-3 border-b border-fitness-primary/20">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-fitness-primary text-sm">Today's Focus:</h4>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-fitness-primary to-fitness-success transition-all duration-300"
                    style={{ 
                      width: `${Math.round((Object.values(completedExercises).filter(Boolean).length / 
                        Object.values(workout.exercises).flat().filter(exercise => exercise.trim()).length) * 100)}%` 
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-fitness-primary">
                  {Object.values(completedExercises).filter(Boolean).length}/{Object.values(workout.exercises).flat().filter(exercise => exercise.trim()).length}
                </span>
              </div>
            </div>
          </div>

          {/* Exercise Checklist - Scrollable */}
          <div className="bg-muted/50 rounded-lg p-3 flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2">
              {workout.muscles.map((muscle) => (
                <div key={muscle} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-fitness-primary/20 text-fitness-primary text-xs rounded-full font-medium">
                      {muscle}
                    </span>
                  </div>
                  <div className="ml-1 space-y-1">
                    {workout.exercises[muscle]?.filter(exercise => exercise.trim()).map((exercise, index) => {
                      const exerciseKey = `${muscle}-${index}`;
                      return (
                        <div key={exerciseKey} className="flex items-center space-x-2 p-2 rounded-lg bg-background/60 border border-border/30">
                          <Checkbox
                            id={exerciseKey}
                            checked={completedExercises[exerciseKey] || false}
                            onCheckedChange={(checked) => handleExerciseComplete(exerciseKey, checked as boolean)}
                            className="data-[state=checked]:bg-fitness-success data-[state=checked]:border-fitness-success"
                          />
                          <label 
                            htmlFor={exerciseKey} 
                            className={`text-xs font-medium cursor-pointer flex-1 ${
                              completedExercises[exerciseKey] 
                                ? 'line-through text-muted-foreground' 
                                : 'text-foreground'
                            }`}
                          >
                            {exercise}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Music Info */}
          {musicUrl && (
            <div className="bg-fitness-secondary/10 rounded-lg p-2">
              <p className="text-xs text-fitness-secondary font-medium flex items-center gap-2">
                🎵 Workout music is playing
                {isRunning && <span className="w-1.5 h-1.5 bg-fitness-success rounded-full animate-pulse"></span>}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-3 mt-auto">
            <Button
              onClick={resetTimer}
              variant="outline"
              size="sm"
              className="h-10 w-10 rounded-full border-fitness-accent text-fitness-accent hover:bg-fitness-accent/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={toggleTimer}
              size="lg"
              disabled={isCompleted}
              className={`h-14 w-14 rounded-full text-lg font-bold ${
                isCompleted 
                  ? 'bg-fitness-success hover:bg-fitness-success' 
                  : 'bg-gradient-to-r from-fitness-primary to-fitness-secondary hover:opacity-90'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-6 h-6" />
              ) : isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>

            <div className="w-10"></div>
          </div>

          {/* Status Message */}
          <div className="text-center mt-2">
            {isCompleted ? (
              <p className="text-fitness-success font-semibold text-sm">🎉 Workout Complete!</p>
            ) : isRunning ? (
              <p className="text-fitness-primary font-medium text-sm">Workout in Progress...</p>
            ) : (
              <p className="text-muted-foreground text-sm">Ready to start your workout</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden Audio Element */}
      {musicUrl && (
        <audio
          ref={audioRef}
          preload="auto"
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

export default WorkoutTimer;
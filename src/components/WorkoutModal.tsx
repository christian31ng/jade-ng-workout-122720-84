import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkoutData {
  muscles: string[];
  exercises: Record<string, string[]>;
  duration: number;
}

interface WorkoutModalProps {
  day: string;
  existingData: WorkoutData | null;
  onSave: (day: string, data: WorkoutData) => void;
  onClose: () => void;
}

const WorkoutModal = ({ day, existingData, onSave, onClose }: WorkoutModalProps) => {
  const { toast } = useToast();
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Record<string, string[]>>({});
  const [duration, setDuration] = useState(60);

  const muscleOptions = [
    "Chest", "Back", "Shoulders", "Biceps", "Triceps", 
    "Forearms", "Legs/Glutes", "Abs", "Calves", "Running"
  ];

  useEffect(() => {
    if (existingData) {
      setSelectedMuscles(existingData.muscles);
      setExercises(existingData.exercises);
      setDuration(existingData.duration);
    }
  }, [existingData]);

  const handleMuscleSelect = (muscle: string) => {
    if (selectedMuscles.includes(muscle)) {
      const newMuscles = selectedMuscles.filter(m => m !== muscle);
      setSelectedMuscles(newMuscles);
      const newExercises = { ...exercises };
      delete newExercises[muscle];
      setExercises(newExercises);
    } else if (selectedMuscles.length < 3) {
      setSelectedMuscles([...selectedMuscles, muscle]);
      setExercises({
        ...exercises,
        [muscle]: ["", "", "", "", ""]
      });
    } else {
      toast({
        title: "Limit Reached",
        description: "Maximum of 3 muscle groups only",
        variant: "destructive"
      });
    }
  };

  const handleExerciseChange = (muscle: string, index: number, value: string) => {
    setExercises({
      ...exercises,
      [muscle]: exercises[muscle].map((ex, i) => i === index ? value : ex)
    });
  };

  const handleSave = () => {
    if (selectedMuscles.length === 0) {
      toast({
        title: "No Muscles Selected",
        description: "Please select at least one muscle group",
        variant: "destructive"
      });
      return;
    }

    const workoutData: WorkoutData = {
      muscles: selectedMuscles,
      exercises,
      duration
    };

    onSave(day, workoutData);
    
    toast({
      title: "Workout Saved",
      description: `${day} workout saved successfully!`,
      duration: 3000
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card border-0 sm:border-2 sm:border-fitness-primary/20 rounded-b-none sm:rounded-b-lg shadow-soft">
        <CardHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl font-bold text-fitness-primary">
              {day} Workout Setup
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mobile-button h-10 w-10 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6 pb-6">
          {/* Muscle Selection */}
          <div>
            <Label className="text-lg font-semibold mb-3 block">
              Select Muscle Groups (Max 3)
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {muscleOptions.map((muscle) => (
                <Button
                  key={muscle}
                  variant={selectedMuscles.includes(muscle) ? "default" : "outline"}
                  onClick={() => handleMuscleSelect(muscle)}
                  className={`mobile-button justify-start text-sm ${
                    selectedMuscles.includes(muscle)
                      ? 'bg-fitness-primary hover:bg-fitness-primary/90 text-background'
                      : 'hover:bg-fitness-primary/10 hover:border-fitness-primary'
                  }`}
                >
                  {muscle}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {selectedMuscles.length}/3
            </p>
          </div>

          {/* Exercise Inputs */}
          {selectedMuscles.map((muscle) => (
            <div key={muscle} className="space-y-3">
              <h3 className="text-lg font-semibold text-fitness-secondary">
                {muscle} Exercises
              </h3>
              <div className="space-y-2">
                {exercises[muscle]?.map((exercise, index) => (
                  <div key={index}>
                    <Label htmlFor={`${muscle}-${index}`} className="text-sm text-muted-foreground">
                      Exercise {index + 1}
                    </Label>
                    <Input
                      id={`${muscle}-${index}`}
                      value={exercise}
                      onChange={(e) => handleExerciseChange(muscle, index, e.target.value)}
                      placeholder={`Enter ${muscle.toLowerCase()} exercise...`}
                      className="mobile-input mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Duration */}
          <div>
            <Label htmlFor="duration" className="text-base font-semibold">
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="300"
              step="15"
              value={duration === 0 ? '' : duration}
              onChange={(e) => setDuration(e.target.value === '' ? 0 : Number(e.target.value))}
              className="mobile-input mt-2"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-border sticky bottom-4 bg-card/95 backdrop-blur-sm mb-8">
            <Button
              onClick={handleSave}
              className="mobile-button w-full gradient-primary text-background font-semibold hover:opacity-90 shadow-glow"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutModal;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorkoutModal from "@/components/WorkoutModal";

interface WorkoutData {
  muscles: string[];
  exercises: Record<string, string[]>;
  duration: number;
}

const WorkoutScheduler = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [workoutData, setWorkoutData] = useState<Record<string, WorkoutData>>({});
  const [showModal, setShowModal] = useState(false);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const saved = localStorage.getItem('workoutSchedule');
    if (saved) {
      setWorkoutData(JSON.parse(saved));
    }
  }, []);

  const saveWorkoutData = (data: Record<string, WorkoutData>) => {
    setWorkoutData(data);
    localStorage.setItem('workoutSchedule', JSON.stringify(data));
  };

  const handleDayClick = (day: string) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  const handleSaveWorkout = (day: string, data: WorkoutData) => {
    const newData = { ...workoutData, [day]: data };
    saveWorkoutData(newData);
    setShowModal(false);
    setSelectedDay(null);
  };

  const handleDeleteWorkout = (day: string) => {
    const newData = { ...workoutData };
    delete newData[day];
    saveWorkoutData(newData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 pb-safe-area-inset-bottom">
      <div className="container mx-auto max-w-4xl pb-24">{/* Added mobile bottom padding for watermark */}
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-center">Weekly Workout Planner</h1>
          <Button
            variant="ghost"
            onClick={() => navigate('/summary')}
            className="text-foreground hover:bg-muted"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {days.map((day) => (
            <Card 
              key={day} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                workoutData[day] 
                  ? 'border-fitness-primary bg-fitness-primary/5' 
                  : 'border-border hover:border-fitness-primary/50'
              }`}
              onClick={() => handleDayClick(day)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{day}</h3>
                  {workoutData[day] ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDayClick(day);
                        }}
                        className="h-8 w-8 p-0 hover:bg-fitness-primary/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkout(day);
                        }}
                        className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {workoutData[day] ? (
                  <div className="space-y-2">
                    {workoutData[day].muscles.map((muscle) => (
                      <div key={muscle} className="bg-muted/50 rounded p-2">
                        <h4 className="font-medium text-sm text-fitness-primary mb-1">{muscle}</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {workoutData[day].exercises[muscle]?.filter(exercise => exercise.trim()).map((exercise, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{exercise}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div className="mt-3 pt-2 border-t border-border">
                      <p className="text-sm font-medium text-fitness-secondary">
                        {workoutData[day].duration} {workoutData[day].duration === 1 ? 'minute' : 'minutes'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Tap to add workout</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal */}
        {showModal && selectedDay && (
          <WorkoutModal
            day={selectedDay}
            existingData={workoutData[selectedDay] || null}
            onSave={handleSaveWorkout}
            onClose={() => {
              setShowModal(false);
              setSelectedDay(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default WorkoutScheduler;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Settings } from "lucide-react";
import { format, isToday } from "date-fns";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";
import CustomCalendar from "@/components/CustomCalendar";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface DayTasks {
  [key: string]: Task[];
}

const ScheduleCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<DayTasks>({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    const saved = localStorage.getItem('schedule-tasks');
    if (saved) {
      const parsedTasks = JSON.parse(saved);
      // Convert date strings back to Date objects
      const tasksWithDates: DayTasks = {};
      Object.keys(parsedTasks).forEach(dateKey => {
        tasksWithDates[dateKey] = parsedTasks[dateKey].map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
      });
      setTasks(tasksWithDates);
    }
  }, []);

  const saveTasks = (newTasks: DayTasks) => {
    setTasks(newTasks);
    localStorage.setItem('schedule-tasks', JSON.stringify(newTasks));
  };

  const getDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

  const getTaskCount = (date: Date) => {
    const dateKey = getDateKey(date);
    return tasks[dateKey]?.length || 0;
  };

  const addTask = (taskText: string) => {
    const dateKey = getDateKey(selectedDate);
    const newTask: Task = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
      createdAt: new Date()
    };

    const newTasks = {
      ...tasks,
      [dateKey]: [...(tasks[dateKey] || []), newTask]
    };
    saveTasks(newTasks);
    setShowTaskModal(false);
  };

  const toggleTask = (taskId: string) => {
    const dateKey = getDateKey(selectedDate);
    const dayTasks = tasks[dateKey] || [];
    const updatedTasks = dayTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const newTasks = {
      ...tasks,
      [dateKey]: updatedTasks
    };
    saveTasks(newTasks);
  };

  const deleteTask = (taskId: string) => {
    const dateKey = getDateKey(selectedDate);
    const dayTasks = tasks[dateKey] || [];
    const updatedTasks = dayTasks.filter(task => task.id !== taskId);

    const newTasks = {
      ...tasks,
      [dateKey]: updatedTasks
    };
    saveTasks(newTasks);
  };

  const getCurrentDayTasks = () => {
    const dateKey = getDateKey(selectedDate);
    return tasks[dateKey] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="mobile-container min-h-screen pb-safe-area-inset-bottom">
        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Enji's Sched
          </h1>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Section */}
        <Card className="mobile-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <CustomCalendar
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              onSelectDate={setSelectedDate}
              getTaskCount={getTaskCount}
            />
          </CardContent>
        </Card>

        {/* Selected Date Section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {format(selectedDate, 'EEEE, MMMM d')}
              {isToday(selectedDate) && (
                <span className="text-primary ml-2 text-sm font-normal">Today</span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getCurrentDayTasks().length} task{getCurrentDayTasks().length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button 
            onClick={() => setShowTaskModal(true)}
            size="sm"
            className="mobile-button bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Tasks List */}
        <TaskList
          tasks={getCurrentDayTasks()}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />

        {/* Task Modal */}
        {showTaskModal && (
          <TaskModal
            onAddTask={addTask}
            onClose={() => setShowTaskModal(false)}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Settings } from "lucide-react";
import { format, isToday } from "date-fns";
import TaskDetailModal from "@/components/TaskDetailModal";
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
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
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
  };

  const editTask = (taskId: string, newText: string) => {
    const dateKey = getDateKey(selectedDate);
    const dayTasks = tasks[dateKey] || [];
    const updatedTasks = dayTasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task
    );

    const newTasks = {
      ...tasks,
      [dateKey]: updatedTasks
    };
    saveTasks(newTasks);
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowTaskDetailModal(true);
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
        <Card className="mobile-card mb-6 shadow-3d">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="hover-scale"
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
                className="hover-scale"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <CustomCalendar
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              onSelectDate={handleDateSelect}
              getTaskCount={getTaskCount}
            />
          </CardContent>
        </Card>

        {/* Task Detail Modal */}
        <TaskDetailModal
          isOpen={showTaskDetailModal}
          onClose={() => setShowTaskDetailModal(false)}
          selectedDate={selectedDate}
          tasks={tasks[getDateKey(selectedDate)] || []}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onAddTask={addTask}
          onEditTask={editTask}
        />
      </div>
    </div>
  );
};

export default ScheduleCalendar;
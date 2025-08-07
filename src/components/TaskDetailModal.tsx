import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Trash2, Edit, Plus, X, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (taskText: string) => void;
  onEditTask: (taskId: string, newText: string) => void;
}

const TaskDetailModal = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  tasks, 
  onToggleTask, 
  onDeleteTask, 
  onAddTask,
  onEditTask 
}: TaskDetailModalProps) => {
  const [newTaskText, setNewTaskText] = useState("");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const progressPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText("");
    }
  };

  const handleEditStart = (task: Task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const handleEditSave = (taskId: string) => {
    if (editText.trim()) {
      onEditTask(taskId, editText.trim());
    }
    setEditingTask(null);
    setEditText("");
  };

  const handleEditCancel = () => {
    setEditingTask(null);
    setEditText("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-container max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {format(selectedDate, 'EEEE, MMMM d')}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Section */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {completedTasks.length}/{tasks.length} completed
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-muted"
          />
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>

        {/* Add New Task */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add new task..."
            className="flex-1"
            maxLength={200}
          />
          <Button 
            type="submit" 
            disabled={!newTaskText.trim()}
            size="sm"
            className="gradient-primary"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </form>

        {/* Tasks List */}
        <div className="space-y-4">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                Pending ({pendingTasks.length})
              </h4>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-primary animate-fade-in">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => onToggleTask(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          {editingTask === task.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="text-sm"
                                autoFocus
                              />
                              <Button size="sm" onClick={() => handleEditSave(task.id)}>
                                ✓
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleEditCancel}>
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm font-medium leading-relaxed break-words">
                              {task.text}
                            </p>
                          )}
                        </div>
                        {editingTask !== task.id && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStart(task)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteTask(task.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                Completed ({completedTasks.length})
              </h4>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <Card key={task.id} className="opacity-70 border-l-4 border-l-green-500 animate-fade-in">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => onToggleTask(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-relaxed break-words line-through text-muted-foreground">
                            {task.text}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTask(task.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tasks for this day</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
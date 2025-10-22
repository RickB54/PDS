import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const EmployeeDashboard = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "Detail John's SUV at 2 PM", completed: false },
    { id: "2", text: "Clean Sarah's BMW X5", completed: true },
  ]);
  const [newTask, setNewTask] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
    };
    setTasks([...tasks, task]);
    setNewTask("");
    toast({
      title: "Task Added",
      description: "New task has been added to the list.",
    });
  };

  const deleteTask = () => {
    if (!deleteTaskId) return;
    setTasks(tasks.filter(task => task.id !== deleteTaskId));
    setDeleteTaskId(null);
    toast({
      title: "Task Deleted",
      description: "Task has been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Employee Dashboard" />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6 animate-fade-in">
          {/* Task List */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Today's Tasks</h2>
            
            <div className="space-y-3 mb-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.text}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTaskId(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                className="bg-background border-border"
              />
              <Button onClick={addTask} className="bg-gradient-hero">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6 bg-gradient-card border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Notes & Comments</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments here..."
              className="min-h-[120px] bg-background border-border"
            />
            <Button className="mt-4 bg-gradient-hero">
              Save Notes
            </Button>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 bg-gradient-card border-border">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Completed Today</h3>
              <p className="text-3xl font-bold text-primary">
                {tasks.filter(t => t.completed).length}
              </p>
            </Card>
            <Card className="p-6 bg-gradient-card border-border">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Pending Tasks</h3>
              <p className="text-3xl font-bold text-primary">
                {tasks.filter(t => !t.completed).length}
              </p>
            </Card>
          </div>
        </div>
      </main>

      <AlertDialog open={deleteTaskId !== null} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTask} className="bg-destructive">
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeDashboard;

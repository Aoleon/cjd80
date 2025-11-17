import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Phone, Mail, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { MemberTask } from "@shared/schema";

const createTaskSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200),
  description: z.string().max(2000).optional(),
  taskType: z.enum(['call', 'email', 'meeting', 'custom']),
  dueDate: z.string().optional(),
  assignedTo: z.string().email().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface MemberTasksProps {
  memberEmail: string;
}

const TASK_TYPE_LABELS = {
  call: "Appel",
  email: "Email",
  meeting: "Rendez-vous",
  custom: "Personnalisé",
};

const TASK_STATUS_LABELS = {
  todo: "À faire",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

const TASK_STATUS_COLORS = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  in_progress: "bg-info-light text-info-dark dark:bg-info-dark dark:text-info-light",
  completed: "bg-success-light text-success-dark dark:bg-success-dark dark:text-success-light",
  cancelled: "bg-error-light text-error-dark dark:bg-error-dark dark:text-error-light",
};

const TASK_TYPE_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  custom: Clock,
};

export function MemberTasks({ memberEmail }: MemberTasksProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading, refetch } = useQuery<MemberTask[]>({
    queryKey: ["/api/admin/members", memberEmail, "tasks"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(memberEmail)}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      return data.data || [];
    },
  });

  const createTaskForm = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      taskType: "custom",
      dueDate: "",
      assignedTo: user?.email || "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskFormValues) => {
      return apiRequest("POST", `/api/admin/members/${encodeURIComponent(memberEmail)}/tasks`, {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", memberEmail, "tasks"] });
      toast({ title: "Tâche créée avec succès" });
      setShowCreateDialog(false);
      createTaskForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la tâche",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: any }) => {
      return apiRequest("PATCH", `/api/admin/member-tasks/${taskId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", memberEmail, "tasks"] });
      toast({ title: "Tâche mise à jour" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
    },
  });

  const handleCreateTask = createTaskForm.handleSubmit((data) => {
    createTaskMutation.mutate(data);
  });

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({
      taskId,
      data: { status: newStatus },
    });
  };

  const getTaskIcon = (taskType: string) => {
    const Icon = TASK_TYPE_ICONS[taskType as keyof typeof TASK_TYPE_ICONS] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tâches de suivi</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer une tâche
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
              <DialogDescription>
                Créez une tâche de suivi pour ce membre
              </DialogDescription>
            </DialogHeader>
            <Form {...createTaskForm}>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <FormField
                  control={createTaskForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Appeler pour suivi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createTaskForm.control}
                  name="taskType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de tâche</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="call">Appel</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Rendez-vous</SelectItem>
                          <SelectItem value="custom">Personnalisé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createTaskForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Détails de la tâche..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createTaskForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'échéance</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createTaskForm.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigné à</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="w-full"
                >
                  {createTaskMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer la tâche"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {tasksLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune tâche enregistrée</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getTaskIcon(task.taskType)}
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge className={TASK_STATUS_COLORS[task.status as keyof typeof TASK_STATUS_COLORS]}>
                        {TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS]}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Type: {TASK_TYPE_LABELS[task.taskType as keyof typeof TASK_TYPE_LABELS]}</span>
                      {task.dueDate && (
                        <span>
                          Échéance: {format(new Date(task.dueDate), "dd MMM yyyy HH:mm", { locale: fr })}
                        </span>
                      )}
                      {task.completedAt && (
                        <span>
                          Complétée: {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true, locale: fr })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        disabled={updateTaskMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    {task.status !== 'cancelled' && task.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(task.id, 'cancelled')}
                        disabled={updateTaskMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


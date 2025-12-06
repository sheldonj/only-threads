'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActiveOrganization } from '@/lib/auth-client';
import { type Todo, type TodoList } from '@/zenstack/models';
import { schema } from '@/zenstack/schema-lite';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useClientQueries } from '@zenstackhq/tanstack-query/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function TodoListsCard() {
  const { data: activeOrg } = useActiveOrganization();
  const client = useClientQueries(schema);

  const { data: todoLists, refetch } = client.todoList.useFindMany({
    orderBy: { createdAt: 'desc' },
  });

  const { isPending: isDeleting, mutateAsync: del } =
    client.todoList.useDelete();
  // current editing TodoList
  const [currentOpenList, setCurrentOpenList] = useState<TodoList>();

  // refetch todo lists when active org changes
  useEffect(() => void refetch(), [activeOrg]);

  async function onDelete(id: string) {
    await del({ where: { id } });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
        <div className="w-full flex justify-end">
          <CreateTodoListDialog />
        </div>
      </CardHeader>
      <CardContent className="grid gap-8 grid-cols-1">
        <div className="flex flex-col gap-2">
          {todoLists?.map((list) => (
            <div
              className="flex justify-between items-center"
              key={list.id}
            >
              <div className="flex items-center gap-2">
                <div>
                  <p
                    className="text-sm cursor-pointer"
                    onClick={() => setCurrentOpenList(list)}
                  >
                    {list.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {list.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                disabled={isDeleting}
                onClick={() => onDelete(list.id)}
                size="sm"
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
        <TodoListDialog
          list={currentOpenList}
          onClose={() => setCurrentOpenList(undefined)}
        />
      </CardContent>
    </Card>
  );
}

const CreateTodoListDialog = () => {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const client = useClientQueries(schema);
  const { isPending, mutateAsync: create } = client.todoList.useCreate();

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  async function onCreate() {
    await create({ data: { name } });
    toast.success('Todo list created successfully');
    setOpen(false);
  }

  return (
    <Dialog
      onOpenChange={setOpen}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="default"
        >
          <PlusIcon />
          <p>New Todo List</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>New Todo List</DialogTitle>
          <DialogDescription>Create a new todo list.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>List Name</Label>
            <Input
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              value={name}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={onCreate}
          >
            {isPending ? (
              <Loader2
                className="animate-spin"
                size={16}
              />
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TodoListDialog = ({
  list,
  onClose,
}: {
  readonly list?: TodoList;
  readonly onClose: () => void;
}) => {
  const [title, setTitle] = useState('');
  const client = useClientQueries(schema);

  const { data: todos } = client.todo.useFindMany(
    {
      orderBy: { createdAt: 'desc' },
      where: { listId: list?.id },
    },
    { enabled: Boolean(list) },
  );

  const { isPending, mutateAsync: create } = client.todo.useCreate();

  function onOpenChange(open: boolean) {
    if (!open) {
      onClose();
    }
  }

  async function onCreate() {
    if (!title.trim()) {
      return;
    }

    await create({
      data: { listId: list!.id, title },
    });
    setTitle('');
  }

  return (
    <Dialog
      onOpenChange={onOpenChange}
      open={Boolean(list)}
    >
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>{list?.name}</DialogTitle>
          <div className="pt-4">
            <Input
              disabled={isPending}
              onChange={(e) => setTitle(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  onCreate();
                }
              }}
              placeholder="Enter title and press enter to create"
              value={title}
            />
            <div className="mt-4">
              {todos?.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                />
              ))}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

const TodoItem = ({ todo }: { readonly todo: Todo }) => {
  const client = useClientQueries(schema);
  const { isPending: isUpdating, mutateAsync: update } =
    client.todo.useUpdate();
  const { isPending: isDeleting, mutateAsync: del } = client.todo.useDelete();
  const [isDone, setIsDone] = useState(todo.done);

  async function onToggleDone() {
    await update({ data: { done: !todo.done }, where: { id: todo.id } });
    setIsDone(!todo.done);
  }

  async function onDelete() {
    await del({ where: { id: todo.id } });
  }

  return (
    <div className="flex justify-between">
      <p className={todo.done ? 'line-through' : ''}>{todo.title}</p>
      <div className="flex gap-1 items-center">
        <Checkbox
          checked={isDone}
          disabled={isUpdating || isDeleting}
          onCheckedChange={onToggleDone}
        />
        <Button
          disabled={isUpdating || isDeleting}
          size="icon"
          variant="ghost"
        >
          <TrashIcon
            className="cursor-pointer"
            onClick={onDelete}
          />
        </Button>
      </div>
    </div>
  );
};

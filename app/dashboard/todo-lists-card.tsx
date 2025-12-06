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
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const CreateTodoListDialog = () => {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const client = useClientQueries(schema);
  const { isPending, mutateAsync: create } = client.todoList.useCreate({
    optimisticUpdate: true,
  });

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  const onCreate = useCallback(async () => {
    await create({ data: { name } });
    toast.success('Todo list created successfully');
    setOpen(false);
  }, [create, name]);

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
              onChange={(event) => setName(event.target.value)}
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

const TodoItem = ({ todo }: { readonly todo: Todo }) => {
  const client = useClientQueries(schema);
  const { isPending: isUpdating, mutateAsync: update } = client.todo.useUpdate({
    optimisticUpdate: true,
  });
  const { isPending: isDeleting, mutateAsync: del } = client.todo.useDelete({
    optimisticUpdate: true,
  });
  const [isDone, setIsDone] = useState(todo.done);

  const onToggleDone = useCallback(async () => {
    await update({ data: { done: !todo.done }, where: { id: todo.id } });
    setIsDone(!todo.done);
  }, [todo.done, todo.id, update]);

  const onDelete = useCallback(async () => {
    await del({ where: { id: todo.id } });
  }, [del, todo.id]);

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
          onClick={onDelete}
          size="icon"
          variant="ghost"
        >
          <TrashIcon className="cursor-pointer" />
        </Button>
      </div>
    </div>
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

  const { isPending, mutateAsync: create } = client.todo.useCreate({
    optimisticUpdate: true,
  });

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  const onCreate = useCallback(async () => {
    if (!title.trim() || !list) {
      return;
    }

    await create({
      data: { listId: list.id, title },
    });
    setTitle('');
  }, [create, list, title]);

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onCreate();
      }
    },
    [onCreate],
  );

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [],
  );

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
              onChange={handleTitleChange}
              onKeyUp={handleKeyUp}
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

export default function TodoListsCard() {
  const { data: activeOrg } = useActiveOrganization();
  const client = useClientQueries(schema);

  const { data: todoLists, refetch } = client.todoList.useFindMany({
    orderBy: { createdAt: 'desc' },
  });

  const { isPending: isDeleting, mutateAsync: del } = client.todoList.useDelete(
    { optimisticUpdate: true },
  );
  // current editing TodoList
  const [currentOpenList, setCurrentOpenList] = useState<TodoList>();

  // refetch todo lists when active org changes
  useEffect(() => {
    refetch();
  }, [activeOrg, refetch]);

  const onDelete = useCallback(
    async (id: string) => {
      await del({ where: { id } });
    },
    [del],
  );

  const handleOpenList = useCallback((list: TodoList) => {
    setCurrentOpenList(list);
  }, []);

  const handleDeleteList = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete],
  );

  const handleCloseList = useCallback(() => {
    setCurrentOpenList(undefined);
  }, []);

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
                    onClick={() => handleOpenList(list)}
                  >
                    {list.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {list.createdAt
                      ? new Date(list.createdAt).toLocaleString()
                      : ''}
                  </p>
                </div>
              </div>
              <Button
                disabled={isDeleting}
                onClick={() => handleDeleteList(list.id)}
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
          onClose={handleCloseList}
        />
      </CardContent>
    </Card>
  );
}

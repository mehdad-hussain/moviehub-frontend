import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/lib/schema";
import { getInitials } from "./chat-sidebar";

type UsersListProps = {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  onUserSelect: (user: User) => void;
};

export const UsersList = ({
  users,
  currentUser,
  selectedUser,
  isLoading,
  error,
  onUserSelect,
}: UsersListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <ScrollArea className="h-[30vh]">
      <div className="space-y-0.5 p-2">
        {users.length === 0 ? (
          <div className="text-center text-muted-foreground p-4 italic text-sm">No users found</div>
        ) : (
          users
            .filter((user) => user.id !== currentUser?.id)
            .map((user) => (
              <div
                key={`user-${user.id}`}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                }`}
                onClick={() => onUserSelect(user)}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 mr-3 border border-muted">
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`}
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
              </div>
            ))
        )}
      </div>
    </ScrollArea>
  );
};

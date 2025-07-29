import React from "react";
import { User } from "@supabase/supabase-js";

type Profile = {
  user_id: string;
  name: string;
  profile_pic_url?: string;
};

type PostType = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  profile?: Profile;
  like_count?: number;
  comment_count?: number;
  comments_list?: any[];
  liked_by_user?: boolean;
  likes_list?: any[];
};

type Props = {
  post: PostType;
  user: User | null;
  onLike?: (postId: string, liked: boolean) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string, existingContent: string) => void;
  onEditSubmit?: (e: React.FormEvent) => void;
  editingPostId?: string | null;
  editContent?: string;
  setEditContent?: (text: string) => void;
  showComments?: boolean;
  toggleShowComments?: (postId: string) => void;
  commentsList?: any[];
  commentInput?: string;
  handleCommentInput?: (postId: string, value: string) => void;
  handleAddComment?: (e: React.FormEvent, postId: string) => void;
  submittingComment?: boolean;
};

export const Post: React.FC<Props> = ({
  post,
  user,
  onLike,
  onDelete,
  onEdit,
  onEditSubmit,
  editingPostId,
  editContent,
  setEditContent,
  showComments,
  toggleShowComments,
  commentsList,
  commentInput,
  handleCommentInput,
  handleAddComment,
  submittingComment,
}) => {
  // ...render logic using these props
  return (
    <li>
      {/* Your post card implementation here */}
      {/* Example: */}
      <div>{post.content}</div>
    </li>
  );
};
